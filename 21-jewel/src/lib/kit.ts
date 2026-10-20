// Kit (ConvertKit) API v4 client. Server-only: runs inside the Pages Function.
// Endpoints checked against developers.kit.com (Oct 2026):
//   POST /v4/subscribers                 create, or return existing (200) by email
//   PUT  /v4/subscribers/{id}            update first name and custom fields
//   POST /v4/tags                        create a tag; returns the existing one if the name exists
//   POST /v4/tags/{tag_id}/subscribers   tag an existing subscriber by email_address

const API = 'https://api.kit.com/v4';

export class KitError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export interface KitSubscriber {
  email: string;
  firstName?: string;
  fields: Record<string, string>;
}

export function kitClient(apiKey: string, tagIds: Record<string, number> = {}, fetcher: typeof fetch = fetch) {
  const call = async (method: string, path: string, body: unknown) => {
    const res = await fetcher(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Kit-Api-Key': apiKey },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, any>;
    if (!res.ok) throw new KitError(res.status, `Kit ${method} ${path} failed: ${res.status} ${JSON.stringify(json.errors ?? '')}`);
    return { status: res.status, json };
  };

  async function tagId(name: string): Promise<number> {
    if (tagIds[name]) return tagIds[name];
    const { json } = await call('POST', '/tags', { name });
    tagIds[name] = json.tag.id;
    return json.tag.id;
  }

  return {
    async upsert(sub: KitSubscriber): Promise<number> {
      const body = { email_address: sub.email, first_name: sub.firstName ?? null, state: 'active', fields: sub.fields };
      const { status, json } = await call('POST', '/subscribers', body);
      const id: number = json.subscriber.id;
      // 200 means the subscriber already existed; make sure the new fields are saved.
      if (status === 200) {
        const update: Record<string, unknown> = { email_address: sub.email, fields: sub.fields };
        if (sub.firstName) update.first_name = sub.firstName;
        await call('PUT', `/subscribers/${id}`, update);
      }
      return id;
    },
    async tag(email: string, names: string[]): Promise<void> {
      await Promise.all(names.map(async (n) => call('POST', `/tags/${await tagId(n)}/subscribers`, { email_address: email })));
    },
  };
}
