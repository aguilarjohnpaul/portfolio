// Hero A/B assignment (spec §8). Runs inline in <head> before paint.
// Returns a tiny script string so there is no flicker and no extra request.

export interface HeroTest { enabled: boolean; winner: '' | 'a' | 'b' }

export function heroScript(test: HeroTest): string {
  const root = 'document.documentElement.dataset.hero=';
  if (test.winner) return `${root}'${test.winner}'`;
  if (!test.enabled) return `${root}'a'`;
  return `(function(){var k='hero-variant',v,m=location.search.match(/[?&]hero=(a|b)(?:&|$)/);
try{if(m){v=m[1];localStorage.setItem(k,v)}else{v=localStorage.getItem(k)}}catch(e){if(m)v=m[1]}
if(v!=='a'&&v!=='b'){var r=new Uint8Array(1);crypto.getRandomValues(r);v=r[0]&1?'b':'a';try{localStorage.setItem(k,v)}catch(e){}}
${root}v})()`;
}
