#!/usr/bin/env python3
"""
Demo Script 1 - Data Processing and Analysis
This script demonstrates various data processing operations
including file handling, data transformation, and basic analytics.
"""

import os
import sys
import json
import csv
import random
import datetime
import hashlib
import statistics
from typing import List, Dict, Any, Optional

class DataProcessor:
    """A class for processing and analyzing data."""
    
    def __init__(self, name: str = "default_processor"):
        self.name = name
        self.processed_data = []
        self.metadata = {
            "created_at": datetime.datetime.now().isoformat(),
            "version": "1.0.0",
            "author": "Demo Script"
        }
    
    def generate_sample_data(self, count: int = 100) -> List[Dict[str, Any]]:
        """Generate sample data for demonstration."""
        data = []
        categories = ["electronics", "clothing", "books", "home", "sports"]
        
        for i in range(count):
            record = {
                "id": i + 1,
                "name": f"Product_{i+1}",
                "category": random.choice(categories),
                "price": round(random.uniform(10.0, 500.0), 2),
                "quantity": random.randint(1, 100),
                "rating": round(random.uniform(1.0, 5.0), 1),
                "available": random.choice([True, False])
            }
            data.append(record)
        
        return data
    
    def process_data(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process the data and return statistics."""
        if not data:
            return {"error": "No data to process"}
        
        prices = [item["price"] for item in data]
        quantities = [item["quantity"] for item in data]
        ratings = [item["rating"] for item in data]
        
        stats = {
            "total_records": len(data),
            "price_stats": {
                "mean": statistics.mean(prices),
                "median": statistics.median(prices),
                "stdev": statistics.stdev(prices) if len(prices) > 1 else 0
            },
            "quantity_stats": {
                "mean": statistics.mean(quantities),
                "median": statistics.median(quantities),
                "min": min(quantities), # hello
                "max": max(quantities),
                "stdev": statistics.stdev(quantities) if len(quantities) > 1 else 0
            },
            "rating_stats": {
                "mean": statistics.mean(ratings),
                "median": statistics.median(ratings),
                "min": min(ratings),
                "max": max(ratings),
                "stdev": statistics.stdev(ratings) if len(ratings) > 1 else 0
            }
        }
        
        # Category breakdown
        categories = {}
        for item in data:
            cat = item["category"]
            if cat not in categories:
                categories[cat] = {"count": 0, "total_price": 0}
            categories[cat]["count"] += 1
            categories[cat]["total_price"] += item["price"]
        
        stats["category_breakdown"] = categories
        self.processed_data = data
        
        return stats
    
    def save_to_csv(self, data: List[Dict[str, Any]], filename: str) -> bool:
        """Save data to CSV file."""
        try:
            if not data:
                return False
            
            with open(filename, 'w', newline='') as csvfile:
                fieldnames = data[0].keys()
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(data)
            return True
        except Exception as e:
            print(f"Error saving to CSV: {e}")
            return False
    
    def save_to_json(self, data: Any, filename: str) -> bool:
        """Save data to JSON file."""
        try:
            with open(filename, 'w') as jsonfile:
                json.dump(data, jsonfile, indent=2)
            return True
        except Exception as e:
            print(f"Error saving to JSON: {e}")
            return False
    
    def generate_hash(self, data: str) -> str:
        """Generate SHA-256 hash of the data."""
        return hashlib.sha256(data.encode()).hexdigest()
    
    def filter_data(self, data: List[Dict[str, Any]], 
                   category: Optional[str] = None,
                   min_price: Optional[float] = None,
                   max_price: Optional[float] = None) -> List[Dict[str, Any]]:
        """Filter data based on criteria."""
        filtered = data
        
        if category:
            filtered = [item for item in filtered if item["category"] == category]
        
        if min_price is not None:
            filtered = [item for item in filtered if item["price"] >= min_price]
        
        if max_price is not None:
            filtered = [item for item in filtered if item["price"] <= max_price]
        
        return filtered

def main():
    """Main function to demonstrate the DataProcessor class."""
    print("=== Data Processing Demo ===")
    
    # Create processor instance
    processor = DataProcessor("demo_processor")
    
    # Generate sample data
    print("Generating sample data...")
    sample_data = processor.generate_sample_data(150)
    print(f"Generated {len(sample_data)} records")
    
    # Process data and get statistics
    print("Processing data...")
    stats = processor.process_data(sample_data)
    
    # Display statistics
    print("\n=== Statistics ===")
    print(f"Total records: {stats['total_records']}")
    print(f"Average price: ${stats['price_stats']['mean']:.2f}")
    print(f"Average quantity: {stats['quantity_stats']['mean']:.1f}")
    print(f"Average rating: {stats['rating_stats']['mean']:.1f}")
    
    # Category breakdown
    print("\n=== Category Breakdown ===")
    for category, info in stats['category_breakdown'].items():
        print(f"{category}: {info['count']} items, avg price: ${info['total_price']/info['count']:.2f}")
    
    # Filter example
    print("\n=== Filter Example ===")
    electronics = processor.filter_data(sample_data, category="electronics")
    print(f"Electronics items: {len(electronics)}")
    
    # Save data
    print("\n=== Data Output ===")
    
    # Print sample data
    print("\n--- Sample Data (first 5 records) ---")
    for i, record in enumerate(sample_data[:5]):
        print(f"Record {i+1}: {record}")
    
    # Print full statistics
    print(f"\n--- Full Statistics ---")
    print(json.dumps(stats, indent=2))
    
    # Print filtered data example
    print(f"\n--- Electronics Items ---")
    for item in electronics[:3]:  # Show first 3 electronics items
        print(f"  {item}")
    
    # Generate hash
    data_hash = processor.generate_hash(str(len(sample_data)))
    print(f"\n--- Metadata ---")
    print(f"Data hash: {data_hash}")
    print(f"Processor name: {processor.name}")
    print(f"Created at: {processor.metadata['created_at']}")
    
    print("\n=== Demo Complete ===")

if __name__ == "__main__":
    main()
