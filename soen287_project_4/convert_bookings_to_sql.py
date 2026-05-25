#!/usr/bin/env python3
"""
Convert D1 JSON exports to MySQL INSERT statements
For bookings and booking_requests tables
"""

import json
import sys

def escape_sql_string(value):
    """Escape strings for SQL"""
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return 'TRUE' if value else 'FALSE'
    if isinstance(value, (int, float)):
        return str(value)
    # Escape single quotes and backslashes
    value = str(value).replace('\\', '\\\\').replace("'", "\\'")
    return f"'{value}'"

def json_to_sql_inserts(json_file, table_name):
    """Convert JSON export to SQL INSERT statements"""

    with open(json_file, 'r') as f:
        data = json.load(f)

    results = data[0]['results']

    if not results:
        print(f"-- No data in {table_name}")
        return

    # Get column names from first row
    columns = list(results[0].keys())
    columns_str = ', '.join(columns)

    print(f"\n-- {table_name.upper()} TABLE - {len(results)} rows")
    print(f"INSERT INTO {table_name} ({columns_str}) VALUES")

    # Generate INSERT statements
    values_list = []
    for row in results:
        values = [escape_sql_string(row[col]) for col in columns]
        values_str = ', '.join(values)
        values_list.append(f"({values_str})")

    # Print all values, comma-separated
    print(',\n'.join(values_list) + ';')

def main():
    print("-- =====================================================")
    print("-- BOOKINGS AND BOOKING REQUESTS DATA")
    print("-- Exported from Cloudflare D1")
    print("-- =====================================================")
    print("\nUSE soen287_project;")
    print("\nSET FOREIGN_KEY_CHECKS = 0;")

    # Process bookings
    try:
        json_to_sql_inserts('d1_export_bookings.json', 'bookings')
    except Exception as e:
        print(f"-- Error processing bookings: {e}", file=sys.stderr)

    # Process booking_requests
    try:
        json_to_sql_inserts('d1_export_booking_requests.json', 'booking_requests')
    except Exception as e:
        print(f"-- Error processing booking_requests: {e}", file=sys.stderr)

    print("\nSET FOREIGN_KEY_CHECKS = 1;")
    print("\n-- Verify")
    print("SELECT 'Bookings imported:' AS Status, COUNT(*) AS Count FROM bookings;")
    print("SELECT 'Booking requests imported:' AS Status, COUNT(*) AS Count FROM booking_requests;")

if __name__ == '__main__':
    main()

