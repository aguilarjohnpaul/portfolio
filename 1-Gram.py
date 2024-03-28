from collections import Counter
import re

def analyze_1grams(text):
    # Define stop words
    stop_words = set(["of", "to", "a", "the", "and", "in", "for", "who","such","an","with","will","an","this","is","some","such","are","but","on","as", "s","or"])

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
provided_text = input("What job description do you want to parse?")

# Analyze and display top 1-grams
sorted_1grams = analyze_1grams(provided_text)
print("Top 1-grams:")
for word, count in sorted_1grams:
    print(word, "-", count)
