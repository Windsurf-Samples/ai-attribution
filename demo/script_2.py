#!/usr/bin/env python3
"""
Demo Script 2 - Web Scraping and Text Processing
This script demonstrates web scraping concepts, text processing,
natural language operations, and data visualization basics.
"""

import os
import sys
import re
import json
import random
import datetime
import hashlib
import math
import time
from typing import List, Dict, Any, Tuple, Optional
from collections import Counter, defaultdict

class TextProcessor:
    """A class for text processing and analysis."""
    
    def __init__(self):
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        }
        self.processed_texts = []
    
    def clean_text(self, text: str) -> str:
        """Clean text by removing special characters and extra whitespace."""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        # Remove URLs
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
        # Remove special characters except spaces and apostrophes
        text = re.sub(r'[^a-zA-Z0-9\s\']', ' ', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def tokenize(self, text: str) -> List[str]:
        """Split text into tokens."""
        return text.lower().split()
    
    def remove_stop_words(self, tokens: List[str]) -> List[str]:
        """Remove stop words from tokens."""
        return [token for token in tokens if token not in self.stop_words]
    
    def get_word_frequency(self, tokens: List[str]) -> Dict[str, int]:
        """Get word frequency count."""
        return dict(Counter(tokens))
    
    def extract_sentences(self, text: str) -> List[str]:
        """Extract sentences from text."""
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def calculate_readability_score(self, text: str) -> Dict[str, float]:
        """Calculate basic readability metrics."""
        sentences = self.extract_sentences(text)
        words = self.tokenize(text)
        
        if not sentences or not words:
            return {"error": "Invalid text for analysis"}
        
        avg_sentence_length = len(words) / len(sentences)
        avg_word_length = sum(len(word) for word in words) / len(words)
        
        # Simple readability score (lower is easier)
        readability = (avg_sentence_length * 0.4) + (avg_word_length * 0.6)
        
        return {
            "sentence_count": len(sentences),
            "word_count": len(words),
            "avg_sentence_length": round(avg_sentence_length, 2),
            "avg_word_length": round(avg_word_length, 2),
            "readability_score": round(readability, 2)
        }

class DataAnalyzer:
    """A class for data analysis and visualization preparation."""
    
    def __init__(self):
        self.datasets = {}
        self.analysis_results = {}
    
    def generate_time_series(self, days: int = 30) -> List[Dict[str, Any]]:
        """Generate sample time series data."""
        data = []
        base_date = datetime.datetime.now() - datetime.timedelta(days=days)
        
        for i in range(days):
            date = base_date + datetime.timedelta(days=i)
            # Simulate some pattern with noise
            base_value = 100 + 10 * math.sin(i * 0.2)
            noise = random.gauss(0, 5)
            value = max(0, base_value + noise)
            
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": round(value, 2),
                "category": random.choice(["sales", "traffic", "engagement"]),
                "region": random.choice(["north", "south", "east", "west"])
            })
        
        return data
    
    def calculate_moving_average(self, data: List[Dict[str, Any]], 
                               window: int = 7) -> List[Dict[str, Any]]:
        """Calculate moving average for time series data."""
        if len(data) < window:
            return data
        
        result = []
        for i in range(len(data)):
            start_idx = max(0, i - window + 1)
            window_data = data[start_idx:i+1]
            avg_value = sum(item["value"] for item in window_data) / len(window_data)
            
            result.append({
                **data[i],
                "moving_avg": round(avg_value, 2)
            })
        
        return result
    
    def detect_anomalies(self, data: List[Dict[str, Any]], 
                        threshold: float = 2.0) -> List[Dict[str, Any]]:
        """Detect anomalies using z-score method."""
        if len(data) < 3:
            return []
        
        values = [item["value"] for item in data]
        mean_val = sum(values) / len(values)
        std_val = math.sqrt(sum((x - mean_val) ** 2 for x in values) / len(values))
        
        anomalies = []
        for item in data:
            if std_val == 0:
                z_score = 0
            else:
                z_score = abs(item["value"] - mean_val) / std_val
            
            if z_score > threshold:
                anomalies.append({
                    **item,
                    "z_score": round(z_score, 2),
                    "anomaly": True
                })
        
        return anomalies
    
    def group_by_category(self, data: List[Dict[str, Any]], 
                         key: str) -> Dict[str, List[Dict[str, Any]]]:
        """Group data by a specific key."""
        groups = defaultdict(list)
        for item in data:
            groups[item[key]].append(item)
        return dict(groups)
    
    def calculate_statistics(self, data: List[Dict[str, Any]], 
                           value_key: str = "value") -> Dict[str, float]:
        """Calculate basic statistics for a dataset."""
        if not data:
            return {"error": "No data available"}
        
        values = [item[value_key] for item in data]
        
        return {
            "count": len(values),
            "mean": sum(values) / len(values),
            "min": min(values),
            "max": max(values),
            "median": sorted(values)[len(values)//2] if values else 0,
            "sum": sum(values),
            "range": max(values) - min(values)
        }

class WebScrapingSimulator:
    """Simulates web scraping operations (without actual HTTP requests)."""
    
    def __init__(self):
        self.scraped_data = []
        self.headers = {
            "User-Agent": "Mozilla/5.0 (compatible; DemoBot/1.0)",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9"
        }
    
    def simulate_article_scraping(self, num_articles: int = 10) -> List[Dict[str, Any]]:
        """Simulate scraping articles from a news site."""
        articles = []
        titles = [
            "Technology Advances in AI",
            "Climate Change Impact Study",
            "Economic Growth Projections",
            "Healthcare Innovation Breakthrough",
            "Education System Reform",
            "Urban Development Plans",
            "Renewable Energy Solutions",
            "Space Exploration Updates",
            "Digital Transformation Trends",
            "Social Media Influence Analysis"
        ]
        
        authors = ["John Smith", "Jane Doe", "Bob Johnson", "Alice Brown", "Charlie Davis"]
        
        for i in range(min(num_articles, len(titles))):
            article = {
                "id": i + 1,
                "title": titles[i],
                "author": random.choice(authors),
                "publish_date": (datetime.datetime.now() - datetime.timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d"),
                "content": self._generate_article_content(),
                "word_count": random.randint(200, 1000),
                "category": random.choice(["technology", "science", "business", "health", "education"]),
                "views": random.randint(100, 10000),
                "likes": random.randint(10, 500)
            }
            articles.append(article)
        
        self.scraped_data = articles
        return articles
    
    def _generate_article_content(self) -> str:
        """Generate random article content."""
        sentences = [
            "The recent developments in this field have been remarkable.",
            "Experts believe this trend will continue in the coming years.",
            "Research has shown significant improvements in key areas.",
            "The implications for future studies are profound.",
            "This discovery opens up new possibilities for innovation.",
            "Stakeholders are optimistic about the potential outcomes.",
            "Further investigation is needed to fully understand the impact.",
            "The community has responded positively to these changes.",
            "Long-term effects remain to be seen.",
            "Collaboration between institutions has been crucial."
        ]
        
        return " ".join(random.sample(sentences, random.randint(3, 6)))
    
    def extract_keywords(self, articles: List[Dict[str, Any]]) -> Dict[str, int]:
        """Extract and count keywords from articles."""
        processor = TextProcessor()
        all_words = []
        
        for article in articles:
            cleaned = processor.clean_text(article["content"])
            tokens = processor.tokenize(cleaned)
            filtered = processor.remove_stop_words(tokens)
            all_words.extend(filtered)
        
        return dict(Counter(all_words).most_common(20))

def main():
    """Main function to demonstrate all classes."""
    print("=== Text Processing and Data Analysis Demo ===")
    
    # Initialize processors
    text_processor = TextProcessor()
    analyzer = DataAnalyzer()
    scraper = WebScrapingSimulator()
    
    # Simulate web scraping
    print("\n=== Simulating Web Scraping ===")
    articles = scraper.simulate_article_scraping(8)
    print(f"Scraped {len(articles)} articles")
    
    # Process text
    print("\n=== Processing Text ===")
    if articles:
        sample_text = articles[0]["content"]
        cleaned_text = text_processor.clean_text(sample_text)
        tokens = text_processor.tokenize(cleaned_text)
        filtered_tokens = text_processor.remove_stop_words(tokens)
        
        print(f"Original text length: {len(sample_text)}")
        print(f"Cleaned text length: {len(cleaned_text)}")
        print(f"Token count: {len(tokens)}")
        print(f"After stop words removal: {len(filtered_tokens)}")
        
        # Readability analysis
        readability = text_processor.calculate_readability_score(sample_text)
        print(f"Readability score: {readability['readability_score']}")
    
    # Generate and analyze time series data
    print("\n=== Time Series Analysis ===")
    time_series = analyzer.generate_time_series(30)
    print(f"Generated {len(time_series)} data points")
    
    # Calculate statistics
    stats = analyzer.calculate_statistics(time_series)
    print(f"Value statistics: mean={stats['mean']:.2f}, min={stats['min']:.2f}, max={stats['max']:.2f}")
    
    # Moving average
    with_ma = analyzer.calculate_moving_average(time_series, window=7)
    print(f"Calculated moving averages with 7-day window")
    
    # Anomaly detection
    anomalies = analyzer.detect_anomalies(time_series)
    print(f"Detected {len(anomalies)} anomalies")
    
    # Group by category
    grouped = analyzer.group_by_category(time_series, "category")
    print(f"Data grouped by {len(grouped)} categories")
    
    # Extract keywords
    keywords = scraper.extract_keywords(articles)
    print(f"\n=== Top Keywords ===")
    for keyword, count in list(keywords.items())[:5]:
        print(f"{keyword}: {count}")
    
    # Save results
    print("\n=== Data Output ===")
    
    # Print article data
    print("\n--- Article Data ---")
    for i, article in enumerate(articles[:3]):  # Show first 3 articles
        print(f"Article {i+1}:")
        print(f"  Title: {article['title']}")
        print(f"  Author: {article['author']}")
        print(f"  Date: {article['publish_date']}")
        print(f"  Category: {article['category']}")
        print(f"  Word count: {article['word_count']}")
        print(f"  Views: {article['views']}")
        print(f"  Likes: {article['likes']}")
        print()
    
    # Print time series data
    print("--- Time Series Data (first 5 points) ---")
    for i, point in enumerate(time_series[:5]):
        print(f"Day {i+1}: {point}")
    
    # Print statistics
    print(f"\n--- Time Series Statistics ---")
    print(json.dumps(stats, indent=2))
    
    # Print moving averages
    print(f"\n--- Moving Averages (first 5 points) ---")
    for i, point in enumerate(with_ma[:5]):
        print(f"Day {i+1}: value={point['value']}, moving_avg={point['moving_avg']}")
    
    # Print grouped data
    print(f"\n--- Grouped by Category ---")
    for category, items in grouped.items():
        print(f"{category}: {len(items)} items")
    
    # Print keywords
    print(f"\n--- Top 10 Keywords ---")
    for keyword, count in list(keywords.items())[:10]:
        print(f"{keyword}: {count}")
    
    # Generate hash
    data_hash = hashlib.sha256(str(len(articles)).encode()).hexdigest()
    print(f"\n--- Metadata ---")
    print(f"Data integrity hash: {data_hash}")
    print(f"Total articles processed: {len(articles)}")
    print(f"Total time series points: {len(time_series)}")
    
    print("\n=== Demo Complete ===")

if __name__ == "__main__":
    main()
