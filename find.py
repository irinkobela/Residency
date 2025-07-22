import json

# --- Configuration ---
JSON_FILE_PATH = 'tests.json'  # The name of your json file
EXPECTED_TOTAL = 2744          # The total number of tests you should have
ID_DIGIT_LENGTH = 5            # The number of digits in your ID, e.g., "00001" is 5

# --- Main Script ---

def find_missing_ids():
    """
    Reads a JSON file, compares its IDs to a generated list of expected IDs,
    and reports which ones are missing.
    """
    
    # Step 1: Generate a set of all expected IDs.
    # We create strings with leading zeros, like "00001", "00002", ... "02744".
    expected_ids = set()
    for i in range(1, EXPECTED_TOTAL + 1):
        # The format string {i:0{ID_DIGIT_LENGTH}} creates a zero-padded number.
        expected_ids.add(f"{i:0{ID_DIGIT_LENGTH}}")

    # Step 2: Read the existing IDs from the JSON file.
    try:
        with open(JSON_FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Create a set of the IDs that are actually in the file for fast lookup.
            existing_ids = {item['id'] for item in data}
    except FileNotFoundError:
        print(f"Error: The file '{JSON_FILE_PATH}' was not found.")
        print("Please make sure the script is in the same directory as your JSON file.")
        return
    except json.JSONDecodeError:
        print(f"Error: The file '{JSON_FILE_PATH}' is not a valid JSON file.")
        print("Please check the file for syntax errors.")
        return
    except KeyError:
        print(f"Error: Some objects in '{JSON_FILE_PATH}' are missing the 'id' key.")
        return

    # Step 3: Find the difference between the two sets.
    # This will give us a set of IDs that are in expected_ids but not in existing_ids.
    missing_ids = sorted(list(expected_ids - existing_ids))

    # Step 4: Report the findings.
    print("--- Analysis Complete ---")
    print(f"Expected number of tests: {EXPECTED_TOTAL}")
    print(f"Found number of tests:    {len(existing_ids)}")
    print(f"Number of missing tests:  {len(missing_ids)}")
    print("-------------------------")

    if missing_ids:
        print("\nThe following IDs are missing:")
        # Print the list of missing IDs.
        for test_id in missing_ids:
            print(test_id)
    else:
        print("\nGood news! No IDs are missing.")

if __name__ == "__main__":
    find_missing_ids()

