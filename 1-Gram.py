from collections import Counter
import re

def analyze_1grams(text):
    # Define stop words
    stop_words = set(["of", "to", "a", "the", "and", "in", "for", "who","such","an","with","an","this","is","some","such","are","but","on","as","or"])

    # Tokenize the text into words
    words = re.findall(r'\b\w+\b', text.lower())

    # Remove stop words
    filtered_words = [word for word in words if word not in stop_words]

    # Count the occurrences of each word
    word_counts = Counter(filtered_words)

    # Sort by frequency
    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)

    return sorted_words

# Provided text
provided_text = """
The Senior Manager, Paid Media Strategy will be an individual contributor focused on developing multi-channel media strategies for some of NP Digital’s largest clients. You’ll work closely with our other paid media team members to guide their thinking as well as oversee and present the overarching paid media strategy for clients. The Sr. Manager candidate has 5 or more years of paid media strategy experience, 3 or more years of agency experience, and the entrepreneurial spirit to build things, move fast, and get things done. 
Develop and deliver integrated paid media plans that forecast business results for our clients 
Coordinate with other channel Directors and Senior Managers in overarching strategy development 
Steward clients’ budgets through meticulous oversight of the team’s campaign spending and pacing throughout media flights   
Develop, deliver, and present client reporting and insights on a weekly, monthly, and quarterly basis   
Conduct market research and meet with paid media vendors to potentially recommend a partnership with NPD clients 
Interpret and report on attribution models across programmatic and other paid media campaigns to illustrate the impact of upper-funnel tactics on performance   
Follow department processes to ensure team is accurately running campaigns 
Stay up-to-date on creative best practices or new creative placements 
Monitor and communicate paid media news and trends for internal and external audiences 
Respond to client questions and ad hoc requests in a timely manner   
Support the new business team with pitch recommendations and deliverables as needed   
Provide feedback on and contribute to department initiatives as a senior-level team member  
Experience (minimum of 5 years) developing and managing complex, multi-platform digital marketing strategies including digital tactics such as: Paid Search, Paid Social, Video, Display, Native, Audio, DOOH and Programmatic Buying 
Thrives off improving paid media campaign performance and the opportunity to drive growth for clients  
Exceptional communication and presentation skills to both external and internal stakeholders  
Proficient in Microsoft PowerPoint and Excel with the ability to develop polished client-facing documents following brand guidelines 
Ability to solve problems and identify opportunities using data & analytics, market research, and strategic frameworks 
Excellent attention to detail and data analysis to ensure campaigns run accurately and insights are uncovered that lead to strategic recommendations  
Strong organizational skills with the ability to prioritize time and workload efficiently  
Team player who is willing to help others whenever needed  
Responsive to constructive feedback to foster personal and professional growth  
Thrives in a fast-paced environment 
Experience pulling syndicated crosstab data 
1+ years of app campaign experience 
Professional certifications, such as Google Ads or Meta Blueprint Media Planning
"""

# Analyze and display top 1-grams
sorted_1grams = analyze_1grams(provided_text)
print("Top 1-grams:")
for word, count in sorted_1grams:
    print(word, "-", count)