---
name: crustdata
description: Crustdata API for company and people enrichment, search, and firmographic data
---

# Crustdata API Skill

Crustdata provides comprehensive firmographic data and growth metrics for companies and people worldwide. This skill covers the REST API for company enrichment, company search, people enrichment, and people search.

## Authentication

**API Key Location:** `~/.config/crustdata/api_key`
**Base URL:** `https://api.crustdata.com`

Include the API key in the `Authorization` header:
```bash
AUTH_TOKEN=$(cat ~/.config/crustdata/api_key)
# Then use: -H "Authorization: Token $AUTH_TOKEN"
```

## API Endpoints Overview

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/screener/company` | GET | Enrich company data by domain/name/ID |
| `/screener/screen/` | POST | Screen companies with complex filters |
| `/screener/company/search` | POST | Search companies with filters |
| `/screener/person/enrich` | GET | Enrich person data by LinkedIn URL |
| `/screener/person/search` | POST | Search people with filters |
| `/screener/posts` | GET | Get social posts by person |
| `/screener/social_posts` | GET | Get social posts with engagement |

---

## Company Enrichment API

Retrieve detailed information about companies using domain, name, or ID.

### Basic Enrichment by Domain

```bash
curl 'https://api.crustdata.com/screener/company?company_domain=hubspot.com' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Accept: application/json'
```

### Multi-Company Enrichment

```bash
curl 'https://api.crustdata.com/screener/company?company_domain=hubspot.com,google.com,stripe.com' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Accept: application/json'
```

### Enrichment with Specific Fields

```bash
curl 'https://api.crustdata.com/screener/company?company_domain=swiggy.com&fields=company_name,headcount.headcount,total_investment_usd' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Accept: application/json'
```

### Get Jobs and News

```bash
curl 'https://api.crustdata.com/screener/company?company_domain=hubspot.com&fields=job_openings,news_articles' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Accept: application/json'
```

### Real-time Enrichment (for unknown companies)

```bash
curl 'https://api.crustdata.com/screener/company?company_domain=newstartup.io&enrich_realtime=True' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Accept: application/json'
```

---

## Company Screening API

Screen companies using complex filter conditions.

### Filter Syntax

```json
{
  "filters": {
    "op": "and",  // or "or"
    "conditions": [
      {
        "column": "column_name",
        "type": "operator",
        "value": "value",
        "allow_null": false
      }
    ]
  },
  "offset": 0,
  "count": 100,
  "sorts": []
}
```

### Filter Operators

| Operator | Description |
|----------|-------------|
| `=` | Equals |
| `=>` | Greater than or equal |
| `<=` | Less than or equal |
| `(.)` | Contains (for text search) |

### Example: High-Growth Funded Companies in USA

```bash
curl 'https://api.crustdata.com/screener/screen/' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "filters": {
      "op": "and",
      "conditions": [
        {"column": "total_investment_usd", "type": "=>", "value": 5000000, "allow_null": false},
        {"column": "headcount", "type": "=>", "value": 50, "allow_null": false},
        {"column": "largest_headcount_country", "type": "(.)", "value": "USA", "allow_null": false}
      ]
    },
    "offset": 0,
    "count": 100
  }'
```

### Example: Companies by Domain

```bash
curl 'https://api.crustdata.com/screener/screen/' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "filters": {
      "op": "or",
      "conditions": [
        {"column": "company_website_domain", "type": "=", "value": "stripe.com", "allow_null": false},
        {"column": "company_website_domain", "type": "=", "value": "plaid.com", "allow_null": false}
      ]
    },
    "offset": 0,
    "count": 100
  }'
```

---

## Company Search API (Filter-Based)

Search companies using structured filters.

### Filter Types for Company Search

| Filter Type | Description | Values |
|-------------|-------------|--------|
| `COMPANY_HEADCOUNT` | Company size | "1-10", "11-50", "51-200", "201-500", "501-1,000", "1,001-5,000", "5,001-10,000", "10,001+" |
| `REGION` | Geographic region | See regions JSON |
| `INDUSTRY` | Industry category | Technology, Finance, Healthcare, etc. |
| `ANNUAL_REVENUE` | Revenue range | `{min, max}` with currency sub_filter |
| `ACCOUNT_ACTIVITIES` | Recent events | "Senior leadership changes in last 3 months", "Funding events in past 12 months" |
| `JOB_OPPORTUNITIES` | Hiring status | "Hiring" |
| `COMPANY_HEADCOUNT_GROWTH` | Headcount growth | `{min, max}` percentage |
| `DEPARTMENT_HEADCOUNT` | Department size | sub_filter: "Engineering", "Sales", "Marketing", etc. |
| `KEYWORD` | Keyword search | List of strings (max 1) |
| `FORTUNE` | Fortune ranking | "Fortune 50", "Fortune 51-100", etc. |

### Example: Large Tech Companies Outside US

```bash
curl 'https://api.crustdata.com/screener/company/search' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "filters": [
      {"filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["1,001-5,000", "5,001-10,000", "10,001+"]},
      {"filter_type": "ANNUAL_REVENUE", "type": "between", "value": {"min": 1, "max": 500}, "sub_filter": "USD"},
      {"filter_type": "REGION", "type": "not in", "value": ["United States"]}
    ],
    "page": 1
  }'
```

### Example: Recently Funded Companies

```bash
curl 'https://api.crustdata.com/screener/company/search' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "filters": [
      {"filter_type": "ACCOUNT_ACTIVITIES", "type": "in", "value": ["Funding events in past 12 months"]}
    ],
    "page": 1
  }'
```

---

## People Enrichment API

Enrich person data using LinkedIn profile URL.

```bash
curl 'https://api.crustdata.com/screener/person/enrich?linkedin_profile_url=https://linkedin.com/in/satyanadella' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Accept: application/json'
```

---

## People Search API

Search for people using structured filters.

### Filter Types for People Search

| Filter Type | Description | Values |
|-------------|-------------|--------|
| `CURRENT_COMPANY` | Current employer | List of company names |
| `CURRENT_TITLE` | Current job title | List of titles |
| `PAST_TITLE` | Previous titles | List of titles |
| `COMPANY_HEADQUARTERS` | Company HQ location | Region values |
| `COMPANY_HEADCOUNT` | Company size | "Self-employed", "1-10", ..., "10,001+" |
| `REGION` | Person's location | Region values |
| `INDUSTRY` | Company industry | Industry values |
| `SENIORITY_LEVEL` | Role seniority | "Owner / Partner", "CXO", "Vice President", "Director", etc. |
| `YEARS_AT_CURRENT_COMPANY` | Tenure | "Less than 1 year", "1 to 2 years", etc. |
| `YEARS_OF_EXPERIENCE` | Total experience | "Less than 1 year", "1 to 2 years", etc. |
| `FUNCTION` | Job function | "Engineering", "Sales", "Marketing", etc. |
| `PAST_COMPANY` | Previous employers | List of company names |
| `KEYWORD` | Keyword search | List of strings (max 1) |
| `RECENTLY_CHANGED_JOBS` | Job changers | Boolean filter |
| `IN_THE_NEWS` | News mentions | Boolean filter |

### Example: Senior Executives in Tech

```bash
curl 'https://api.crustdata.com/screener/person/search' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "filters": [
      {"filter_type": "INDUSTRY", "type": "in", "value": ["Technology", "Information Technology and Services"]},
      {"filter_type": "COMPANY_HEADCOUNT", "type": "in", "value": ["501-1,000", "1,001-5,000", "5,001-10,000", "10,001+"]},
      {"filter_type": "SENIORITY_LEVEL", "type": "in", "value": ["CXO", "Vice President", "Director"]}
    ],
    "page": 1
  }'
```

### Example: Find Decision Makers at Target Company

```bash
curl 'https://api.crustdata.com/screener/person/search' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "filters": [
      {"filter_type": "CURRENT_COMPANY", "type": "in", "value": ["Acme Corp"]},
      {"filter_type": "SENIORITY_LEVEL", "type": "in", "value": ["CXO", "Vice President", "Director"]}
    ],
    "page": 1
  }'
```

---

## Social Posts API

Get recent social posts for a person.

```bash
curl 'https://api.crustdata.com/screener/social_posts?person_linkedin_url=https://linkedin.com/in/abhilash-chowdhary&page=1' \
  -H 'Authorization: Token $AUTH_TOKEN' \
  -H 'Accept: application/json'
```

---

## Key Company Data Fields

### Firmographics
- `company_name`, `company_website`, `company_website_domain`
- `hq_country`, `largest_headcount_country`
- `year_founded`, `industries`, `categories`
- `valuation_usd`, `total_investment_usd`
- `last_funding_round_type`, `days_since_last_fundraise`
- `investors`

### Headcount Metrics
- `headcount` - Total employees
- `headcount_engineering`, `headcount_sales`, `headcount_operations`
- `headcount_mom_pct`, `headcount_qoq_pct`, `headcount_yoy_pct`
- `headcount_usa`, `headcount_india`

### Growth & Signals
- `job_openings_count`, `job_openings_title`
- `monthly_visitors` (web traffic)
- `overall_rating`, `ceo_approval_pct` (employee reviews)
- `news_articles`

### Founder Data
- `founder_names_and_profile_urls`
- `founders_location`, `founders_education_institute`
- `founders_previous_company`, `founders_previous_title`
- `founders_email`

---

## Key People Data Fields

- `name`, `headline`, `summary`
- `linkedin_profile_url`, `flagship_profile_url`
- `location`, `profile_picture_url`
- `current_title`, `current_company`
- `employer` (array of work history)
- `education_background`
- `skills`, `num_of_connections`

---

## Pagination

- Company Search: Returns 25 results per page. Use `page` parameter.
- Screening API: Use `offset` and `count` parameters (max 100).

---

## Rate Limits

Contact Crustdata for rate limit details. Real-time enrichment may have lower limits.

---

## Common Use Cases

### 1. Find Target Companies for Outreach
- Filter by industry, headcount, revenue, region
- Check for funding events or leadership changes

### 2. Enrich CRM Data
- Batch enrich companies by domain
- Get headcount, funding, job openings

### 3. Find Decision Makers
- Search people by company + seniority
- Get LinkedIn profiles and contact info

### 4. Monitor Competitors
- Track headcount growth
- Watch for job postings and news

### 5. Source Investment Targets
- Screen for funded companies with growth metrics
- Filter by valuation, revenue, headcount growth

---

## Error Handling

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 400 | Bad request (invalid filters) |
| 401 | Unauthorized (bad token) |
| 429 | Rate limited |

---

## Documentation Links

- Full docs: https://docs.crustdata.com
- API reference: https://docs.crustdata.com/api
- Filters guide: https://docs.crustdata.com/docs/discover/how-to-build-filters
- Company dictionary: https://docs.crustdata.com/docs/dictionary/company
- People dictionary: https://docs.crustdata.com/docs/dictionary/people

---

## Support

Email: abhilash@crustdata.com
