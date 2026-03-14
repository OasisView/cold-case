"""
Cold Case Cluster Finder — Data Loader
Reads SHR65_23.csv, normalizes data, and loads into Supabase.
Run from project root: python3 scripts/loader.py

Requires .env.local with:
  SUPABASE_SERVICE_ROLE_KEY=...   (used by this loader — bypasses RLS)
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=  (frontend only — NOT used here)
"""

import csv
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Load env vars from .env.local
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
# Loader uses the service role key (bypasses RLS for bulk inserts)
# The anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) is for the frontend only
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local")
    print("       SUPABASE_SERVICE_ROLE_KEY is in Supabase > Settings > API > service_role key")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================
# TABLE NAMES — update here if your Supabase tables differ
# ============================================================
HOMICIDES_TABLE = 'homicides'
AGENCIES_TABLE = 'agencies'
STATE_RELIABILITY_TABLE = 'state_reliability'

# Expected columns in the homicides table (pre-flight check)
EXPECTED_COLUMNS = {
    'id', 'ori', 'agency', 'agency_type', 'state', 'year', 'month',
    'solved', 'victim_sex', 'victim_age', 'victim_race', 'victim_ethnicity',
    'offender_sex', 'offender_age', 'offender_race', 'offender_ethnicity',
    'weapon_code', 'weapon_label', 'relationship', 'victim_count', 'offender_count',
    'county_fips', 'msa', 'circumstance', 'source', 'lat', 'lng',
}

# ============================================================
# WEAPON STRING → NUMERIC CODE MAPPING
# From CLAUDE.md — must match frontend constants.ts
# ============================================================
WEAPON_MAP = {
    'Handgun - pistol, revolver, etc': 12,
    'Rifle': 13,
    'Shotgun': 14,
    'Firearm, type not stated': 11,
    'Other gun': 15,
    'Knife or cutting instrument': 20,
    'Blunt object - hammer, club, etc': 30,
    'Personal weapons, includes beating': 40,
    'Fire': 65,
    'Narcotics or drugs, sleeping pills': 70,
    'Drowning': 75,
    'Strangulation - hanging': 80,
    'Asphyxiation - includes death by gas': 85,
    'Other or type unknown': 99,
    'Weapon Not Reported': 99,
    # database.csv style strings (in case any appear)
    'Handgun': 12,
    'Knife': 20,
    'Blunt Object': 30,
    'Strangulation': 80,
    'Suffocation': 85,
    'Firearm': 11,
    'Gun': 15,
    'Drugs': 70,
    'Unknown': 99,
}

# ============================================================
# STATE NAME FIX
# ============================================================
def fix_state(state):
    """Fix known typos in state names."""
    if state == 'Rhodes Island':
        return 'Rhode Island'
    return state

# ============================================================
# PARSE INTEGER SAFELY
# ============================================================
def safe_int(value, default=None):
    """Convert to int, return default if blank or invalid."""
    if value is None or value == '' or value == 'null':
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

# ============================================================
# GET WEAPON CODE
# ============================================================
def get_weapon_code(weapon_str):
    """Map weapon string to numeric code."""
    if not weapon_str or weapon_str == '':
        return 99
    return WEAPON_MAP.get(weapon_str, 99)

# ============================================================
# NORMALIZE COUNTY FIPS
# ============================================================
def normalize_fips(raw_fips):
    """
    Return a valid 5-digit FIPS string, or None.
    SHR65_23.csv stores CNTYFIPS as text like 'King, WA' — not numeric.
    Those get NULL until geocode.py resolves them via ORI lookup.
    """
    if not raw_fips:
        return None
    val = str(raw_fips).strip()
    if val.isdigit() and len(val) == 5:
        return val
    # Pad 4-digit FIPS (e.g. '1001' → '01001')
    if val.isdigit() and len(val) == 4:
        return val.zfill(5)
    return None

# ============================================================
# PROCESS ONE ROW
# ============================================================
def process_row(row):
    """
    Transform a raw CSV row into a dict matching the homicides table schema.
    SHR65_23.csv columns: ID, Ori, Agency, Agentype, State, Year, Month,
    Solved, VicSex, VicAge, VicRace, VicEthnic, OffSex, OffAge, OffRace,
    OffEthnic, Weapon, Relationship, VicCount, OffCount, Source, CNTYFIPS, MSA, Circumstance
    """
    offender_sex = row.get('OffSex', 'U') or 'U'
    solved = offender_sex != 'U'  # MAP's definition: offender sex known = solved

    weapon_str = row.get('Weapon', '') or ''
    weapon_code = get_weapon_code(weapon_str)

    state = fix_state(row.get('State', '') or '')

    return {
        'id': row.get('ID', ''),
        'ori': row.get('Ori', ''),
        'agency': row.get('Agency', ''),
        'agency_type': row.get('Agentype', ''),
        'state': state,
        'year': safe_int(row.get('Year')),
        'month': safe_int(row.get('Month')),
        'solved': solved,
        'victim_sex': row.get('VicSex', ''),
        'victim_age': safe_int(row.get('VicAge')),
        'victim_race': row.get('VicRace', ''),
        'victim_ethnicity': row.get('VicEthnic', ''),
        'offender_sex': offender_sex,
        'offender_age': safe_int(row.get('OffAge')),
        'offender_race': row.get('OffRace', ''),
        'offender_ethnicity': row.get('OffEthnic', ''),
        'weapon_code': weapon_code,
        'weapon_label': weapon_str,
        'relationship': row.get('Relationship', ''),
        'victim_count': safe_int(row.get('VicCount'), 0),
        'offender_count': safe_int(row.get('OffCount'), 0),
        'county_fips': normalize_fips(row.get('CNTYFIPS', '')),
        'msa': row.get('MSA', ''),
        'circumstance': row.get('Circumstance', ''),
        'source': row.get('Source', ''),
        'lat': None,   # populated later by geocode.py via agencies table
        'lng': None,
    }

# ============================================================
# PRE-FLIGHT CHECK
# Verify the homicides table exists and has all expected columns.
# Aborts with a clear error if anything is missing.
# ============================================================
def preflight_check():
    """Verify homicides table schema before loading any data."""
    print(f"\n{'='*60}")
    print(f"PRE-FLIGHT CHECK")
    print(f"{'='*60}")

    try:
        result = supabase.rpc('get_columns', {'tbl': HOMICIDES_TABLE}).execute()
        # Fallback: query information_schema directly
        raise Exception("use information_schema")
    except Exception:
        pass

    try:
        result = supabase \
            .from_('information_schema.columns') \
            .select('column_name') \
            .eq('table_name', HOMICIDES_TABLE) \
            .execute()
        actual_columns = {row['column_name'] for row in (result.data or [])}
    except Exception:
        # information_schema may not be accessible via anon-style queries.
        # Fall back to a SELECT on the table itself to check columns exist.
        try:
            result = supabase.table(HOMICIDES_TABLE).select('*').limit(1).execute()
            if result.data:
                actual_columns = set(result.data[0].keys())
            else:
                # Table exists but empty — assume columns are correct
                print(f"  Table '{HOMICIDES_TABLE}' exists and is empty — skipping column check")
                print(f"  PRE-FLIGHT PASSED")
                return
        except Exception as e:
            print(f"  ERROR: Cannot connect to table '{HOMICIDES_TABLE}': {e}")
            print(f"  Make sure the table exists in Supabase before running the loader.")
            sys.exit(1)

    missing = EXPECTED_COLUMNS - actual_columns
    if missing:
        print(f"  ERROR: Missing columns in '{HOMICIDES_TABLE}' table:")
        for col in sorted(missing):
            print(f"    - {col}")
        print(f"\n  Add these columns in Supabase Table Editor, then re-run.")
        sys.exit(1)

    print(f"  Table '{HOMICIDES_TABLE}' found with all {len(EXPECTED_COLUMNS)} expected columns")
    print(f"  PRE-FLIGHT PASSED")

# ============================================================
# ROW-LEVEL VALIDATION
# Insert first 100 rows, query back, verify count matches.
# Aborts if schema mismatch or insert failure detected early.
# ============================================================
def validate_first_100(rows):
    """Insert first 100 rows and verify they land correctly."""
    print(f"\n{'='*60}")
    print(f"ROW-LEVEL VALIDATION (first 100 rows)")
    print(f"{'='*60}")

    sample = rows[:100]
    # Deduplicate by id within the sample
    deduped = list({r['id']: r for r in sample}.values())

    try:
        supabase.table(HOMICIDES_TABLE).upsert(deduped, on_conflict='id').execute()
    except Exception as e:
        print(f"  ERROR: Failed to insert validation rows: {e}")
        sys.exit(1)

    # Query back
    ids = [r['id'] for r in deduped]
    try:
        result = supabase.table(HOMICIDES_TABLE) \
            .select('id', count='exact') \
            .in_('id', ids) \
            .execute()
        count = result.count if result.count is not None else len(result.data)
    except Exception as e:
        print(f"  ERROR: Could not verify row count: {e}")
        sys.exit(1)

    if count != len(deduped):
        print(f"  ERROR: Inserted {len(deduped)} rows but only found {count} in database")
        print(f"  Schema mismatch or RLS issue — aborting.")
        sys.exit(1)

    print(f"  Inserted {len(deduped)} rows, verified {count} in database — PASSED")
    return len(deduped)

# ============================================================
# LIVE COUNT CHECK
# ============================================================
def print_live_count():
    """Query and print the current row count in the homicides table."""
    try:
        result = supabase.table(HOMICIDES_TABLE).select('id', count='exact').execute()
        count = result.count if result.count is not None else '?'
        print(f"  [LIVE COUNT] homicides table: {count:,}" if isinstance(count, int) else f"  [LIVE COUNT] homicides table: {count}")
    except Exception as e:
        print(f"  [LIVE COUNT] could not query: {e}")

# ============================================================
# UPSERT ONE BATCH (no retry — fail fast)
# ============================================================
def upsert_batch(table, batch, batch_num):
    """
    Deduplicate within batch, then upsert. Fails immediately on error.
    Deduplication prevents: ON CONFLICT DO UPDATE cannot affect a row a second time.
    """
    # Deduplicate by id within batch — keep last occurrence
    deduped = list({r['id']: r for r in batch}.values())
    dupes = len(batch) - len(deduped)
    if dupes > 0:
        print(f"  Batch {batch_num}: deduplicated {dupes} duplicate IDs")

    try:
        supabase.table(table).upsert(deduped, on_conflict='id').execute()
        print(f"  Batch {batch_num}: upserted {len(deduped)} rows")
        return len(deduped)
    except Exception as e:
        print(f"\nFATAL ERROR in batch {batch_num}: {e}")
        print(f"Aborting. Fix the error above and re-run.")
        sys.exit(1)

# ============================================================
# LOAD HOMICIDES
# ============================================================
def load_homicides():
    """Load SHR65_23.csv into the homicides table."""
    csv_path = 'data/SHR65_23.csv'

    if not os.path.exists(csv_path):
        print(f"ERROR: {csv_path} not found. Make sure you're running from the project root.")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"LOADING HOMICIDES FROM {csv_path}")
    print(f"Target table: {HOMICIDES_TABLE}")
    print(f"{'='*60}")

    # Count total rows first
    with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.reader(f)
        header = next(reader)
        total_rows = sum(1 for _ in reader)
    print(f"Total rows in CSV: {total_rows:,}")
    print(f"CSV columns: {header}")

    BATCH_SIZE = 500
    batch = []
    inserted_total = 0
    processed = 0
    skipped = 0
    rhode_island_fixes = 0
    fips_nulled = 0
    batch_count = 0
    validation_done = False
    first_rows = []  # collect first 100 for validation

    # Track Washington state for early Green River test
    washington_done = False
    last_state = None

    with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)

        for row in reader:
            processed += 1

            # Skip rows with no ID
            if not row.get('ID', '').strip():
                skipped += 1
                continue

            # Count Rhode Island fixes before processing
            if row.get('State', '') == 'Rhodes Island':
                rhode_island_fixes += 1

            # Count FIPS values that will become NULL
            raw_fips = row.get('CNTYFIPS', '')
            if raw_fips and normalize_fips(raw_fips) is None:
                fips_nulled += 1

            record = process_row(row)
            current_state = record['state']

            # Collect first 100 rows for row-level validation
            if len(first_rows) < 100:
                first_rows.append(record)

            # Run row-level validation after collecting 100 rows
            if len(first_rows) == 100 and not validation_done:
                validate_first_100(first_rows)
                validation_done = True
                # These 100 rows are already in DB — don't re-add to batch
                inserted_total += len({r['id']: r for r in first_rows}.values())
                last_state = current_state
                continue

            batch.append(record)

            # Detect when Washington state rows have all been processed
            if last_state == 'Washington' and current_state != 'Washington' and not washington_done:
                # Flush current batch before running Green River test
                if batch:
                    inserted_total += upsert_batch(HOMICIDES_TABLE, batch, batch_count + 1)
                    batch_count += 1
                    batch = []
                washington_done = True
                print(f"\n  Washington state rows complete — running early Green River test:")
                verify_green_river()

            last_state = current_state

            if len(batch) >= BATCH_SIZE:
                batch_count += 1
                inserted_total += upsert_batch(HOMICIDES_TABLE, batch, batch_count)
                batch = []

                # Live count every 50 batches
                if batch_count % 50 == 0:
                    pct = (processed / total_rows) * 100
                    print(f"  Progress: {processed:,} / {total_rows:,} ({pct:.1f}%)")
                    print_live_count()

        # Insert remaining rows
        if batch:
            batch_count += 1
            inserted_total += upsert_batch(HOMICIDES_TABLE, batch, batch_count)

    print(f"\n{'='*60}")
    print(f"HOMICIDES LOAD COMPLETE")
    print(f"  Processed:          {processed:,}")
    print(f"  Upserted:           {inserted_total:,}")
    print(f"  Skipped (no ID):    {skipped:,}")
    print(f"  Rhode Island fixes: {rhode_island_fixes:,}")
    print(f"  FIPS set to NULL:   {fips_nulled:,} (will be resolved by geocode.py)")
    print(f"{'='*60}")

    return inserted_total

# ============================================================
# LOAD AGENCIES
# ============================================================
def load_agencies():
    """
    Extract unique agency records from SHR65_23.csv and load into agencies table.
    lat/lng are NULL until geocode.py runs the Mapbox geocoding step.
    """
    csv_path = 'data/SHR65_23.csv'

    if not os.path.exists(csv_path):
        print(f"ERROR: {csv_path} not found.")
        return 0

    print(f"\n{'='*60}")
    print(f"LOADING AGENCIES FROM {csv_path}")
    print(f"Target table: {AGENCIES_TABLE}")
    print(f"{'='*60}")

    agencies = {}  # ori -> {name, type, state}

    with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ori = row.get('Ori', '').strip()
            if not ori:
                continue
            if ori not in agencies:
                agencies[ori] = {
                    'ori': ori,
                    'name': row.get('Agency', ''),
                    'type': row.get('Agentype', ''),
                    'state': fix_state(row.get('State', '') or ''),
                    'county_fips': None,  # resolved by geocode.py
                    'lat': None,
                    'lng': None,
                }

    print(f"  Unique ORIs found: {len(agencies):,}")

    # Upsert in batches of 500
    agency_list = list(agencies.values())
    BATCH_SIZE = 500
    inserted_total = 0

    for i in range(0, len(agency_list), BATCH_SIZE):
        batch = agency_list[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        try:
            supabase.table(AGENCIES_TABLE).upsert(batch, on_conflict='ori').execute()
            inserted_total += len(batch)
            print(f"  Batch {batch_num}: upserted {len(batch)} agencies")
        except Exception as e:
            print(f"\nFATAL ERROR in agencies batch {batch_num}: {e}")
            sys.exit(1)

    print(f"\n  Agencies upserted: {inserted_total:,}")
    print(f"  lat/lng: NULL — run scripts/geocode.py next")
    print(f"{'='*60}")

    return inserted_total

# ============================================================
# LOAD STATE RELIABILITY
# ============================================================
def load_state_reliability():
    """Load State_Reporting_Rates_2022.csv into the state_reliability table."""
    csv_path = 'data/State_Reporting_Rates_2022.csv'

    # Also try the xlsx version name
    if not os.path.exists(csv_path):
        alternatives = [
            'data/State_Reporting_Rates_2022.xlsx - State Reporting Rates 2022.csv',
            'data/State_Reporting_Rates_2022.xlsx',
        ]
        for alt in alternatives:
            if os.path.exists(alt):
                csv_path = alt
                break
        else:
            print(f"WARNING: State reporting rates file not found. Skipping.")
            return 0

    print(f"\n{'='*60}")
    print(f"LOADING STATE RELIABILITY FROM {csv_path}")
    print(f"{'='*60}")

    rows = []
    with open(csv_path, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            state = row.get('State', '').strip()
            if not state:
                continue
            # Skip the aggregate total row at the bottom of the CSV
            if state.lower().startswith('zz'):
                continue

            state = fix_state(state)

            agencies_total = safe_int(row.get('Agencies'), 0)
            agencies_reporting = safe_int(row.get('FBI'), 0)

            # Percent2 column is already the decimal reporting rate (e.g. 0.68)
            # Percent column is the integer version (e.g. 68)
            pct2 = row.get('Percent2', '')
            try:
                reporting_pct = float(pct2) if pct2 else 0.0
            except (ValueError, TypeError):
                reporting_pct = 0.0

            rows.append({
                'state': state,
                'agencies_total': agencies_total,
                'agencies_reporting': agencies_reporting,
                'reporting_pct': reporting_pct,
            })

    if rows:
        try:
            supabase.table(STATE_RELIABILITY_TABLE).upsert(rows, on_conflict='state').execute()
            print(f"  Upserted {len(rows)} state records")
        except Exception as e:
            print(f"\nFATAL ERROR loading state reliability: {e}")
            sys.exit(1)

    # Spot-check low-reporting states
    low_reporting = [(r['state'], r['reporting_pct']) for r in rows if r['reporting_pct'] < 0.60]
    if low_reporting:
        print(f"  Low-reporting states (< 60%):")
        for state, pct in sorted(low_reporting, key=lambda x: x[1]):
            print(f"    {state}: {pct:.0%}")

    expected_rows = 52  # 50 states + DC + Rhode Island (fixed from Rhodes Island)
    if len(rows) != expected_rows:
        print(f"  WARNING: Expected {expected_rows} rows, got {len(rows)}")
    else:
        print(f"  States loaded: {len(rows)} (PASS — expected {expected_rows})")

    return len(rows)

# ============================================================
# GREEN RIVER VERIFICATION
# ============================================================
def verify_green_river():
    """Run the Green River Killer smoke test query."""
    print(f"\n{'='*60}")
    print(f"GREEN RIVER KILLER VERIFICATION")
    print(f"Filters: Washington + Female + Strangulation (80) + 1980-2000")
    print(f"{'='*60}")

    try:
        result = supabase.table(HOMICIDES_TABLE) \
            .select('county_fips', count='exact') \
            .eq('state', 'Washington') \
            .eq('victim_sex', 'Female') \
            .eq('weapon_code', 80) \
            .gte('year', 1980) \
            .lte('year', 2000) \
            .execute()

        total = result.count if result.count is not None else len(result.data)
        print(f"  Total cases: {total}")

        if 120 <= total <= 140:
            print(f"  PASS — Expected ~128 cases, got {total}")
        else:
            print(f"  WARNING — Expected ~128 cases, got {total}")
            print(f"  This may indicate a data loading issue.")

        return total

    except Exception as e:
        print(f"  ERROR running verification: {e}")
        return 0

# ============================================================
# MAIN
# ============================================================
if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("COLD CASE CLUSTER FINDER — DATA LOADER")
    print("=" * 60)
    print(f"Supabase URL: {SUPABASE_URL}")
    print(f"Service key:  {SUPABASE_KEY[:8]}...{SUPABASE_KEY[-4:]}")
    print(f"Tables: {HOMICIDES_TABLE}, {AGENCIES_TABLE}, {STATE_RELIABILITY_TABLE}")
    print()
    print("NOTE: If re-running after a partial load, truncate tables first:")
    print(f"  TRUNCATE TABLE {HOMICIDES_TABLE};")
    print(f"  TRUNCATE TABLE {AGENCIES_TABLE};")
    print(f"  TRUNCATE TABLE {STATE_RELIABILITY_TABLE};")

    # Step 0: Pre-flight schema check
    preflight_check()

    # Step 1: Load homicides (the big one)
    # Includes: row-level validation, live counts every 50 batches,
    # early Green River test after Washington rows finish
    homicide_count = load_homicides()

    # Step 2: Load agencies (unique ORIs from same CSV)
    agency_count = load_agencies()

    # Step 3: Load state reliability (small file)
    state_count = load_state_reliability()

    # Step 4: Final Green River verification
    print(f"\n{'='*60}")
    print(f"FINAL VERIFICATION")
    print(f"{'='*60}")
    verify_green_river()
    print_live_count()

    print(f"\n{'='*60}")
    print(f"ALL DONE")
    print(f"  Homicides loaded: {homicide_count:,}")
    print(f"  Agencies loaded:  {agency_count:,}")
    print(f"  States loaded:    {state_count}")
    print(f"{'='*60}")
    print(f"\nNext steps:")
    print(f"  1. Send Jonel the Supabase URL + anon key")
    print(f"  2. Start agency geocoding (scripts/geocode.py)")
