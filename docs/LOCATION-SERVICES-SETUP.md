# Location Services Setup Guide

This guide explains how to configure Google Maps API for ZEMO's location-based search features.

## Prerequisites

- Google Cloud Platform account
- Billing enabled (Google Maps APIs require billing, but includes $200 monthly free credit)
- ZEMO project deployed or running locally

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Name it "ZEMO Production" or "ZEMO Development"

## Step 2: Enable Required APIs

Enable these APIs in your Google Cloud project:

1. **Maps JavaScript API** - For displaying maps
2. **Places API** - For autocomplete and place details
3. **Geocoding API** - For address ↔ coordinates conversion
4. **Geolocation API** - For current location detection

### How to Enable:

1. Go to "APIs & Services" → "Library"
2. Search for each API above
3. Click "Enable" for each one

## Step 3: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. Click "Edit API key" to configure restrictions

## Step 4: Configure API Key Restrictions

### Application Restrictions (Choose One)

**For Production:**
- Select "HTTP referrers (web sites)"
- Add your domains:
  ```
  https://zemo.zm/*
  https://*.zemo.zm/*
  https://*.vercel.app/*
  ```

**For Development:**
- Select "HTTP referrers (web sites)"
- Add:
  ```
  http://localhost:3000/*
  http://localhost:*/*
  ```

**Best Practice:** Create separate API keys for development and production

### API Restrictions

Restrict this key to only the APIs you need:

- ✅ Maps JavaScript API
- ✅ Places API
- ✅ Geocoding API
- ✅ Geolocation API

## Step 5: Add API Key to ZEMO

### Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Google Maps API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your-api-key-here
   ```

### Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add new variable:
   - **Name:** `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value:** Your API key
   - **Environment:** Production (and Preview if needed)
4. Redeploy your application

## Step 6: Configure Cron Job Secret

For the late return detection cron job:

### Generate Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Add to Environment

**Local (.env.local):**
```env
CRON_SECRET=your-generated-secret-here
```

**Vercel:**
- Add `CRON_SECRET` environment variable with the generated value

## Step 7: Verify Setup

### Test Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the homepage (http://localhost:3000)
3. Click on the location search box
4. You should see:
   - ✅ Popular locations (Lusaka, Kitwe, etc.)
   - ✅ "Use current location" button
   - ✅ Autocomplete suggestions when typing

### Test on Production

1. Deploy to Vercel
2. Test the same features as above
3. Check browser console for any API errors

## Features Enabled

Once configured, these location features will work:

### 1. Location Autocomplete
- **Component:** `LocationAutocomplete`
- **Location:** Search bar, vehicle creation form
- **Features:**
  - Google Places autocomplete suggestions
  - 6 popular Zambian locations (quick select)
  - Current location detection
  - Address to coordinates conversion

### 2. Map View
- **Component:** `MapView`
- **Location:** Search results page
- **Features:**
  - Display vehicles on map with price markers
  - Cluster markers when zoomed out
  - Vehicle info cards on marker click
  - "Search this area" button
  - Distance calculations from search center

### 3. Distance Calculations
- **Library:** `@/lib/maps`
- **Usage:** Search results, vehicle cards
- **Features:**
  - Haversine formula for accurate distances
  - Formatted display ("2.5 km away", "500m away")
  - Sort search results by distance

### 4. Late Return Detection Cron
- **Endpoint:** `/api/cron/check-late-returns`
- **Schedule:** Runs every hour (Vercel Cron)
- **Features:**
  - Detects overdue rentals (30-min grace period)
  - Calculates late fees (hourly rate, capped at daily)
  - Escalates after 24 hours late
  - Sends notifications to both parties

## Troubleshooting

### Issue: "Google Maps JavaScript API error"

**Cause:** API not enabled or API key invalid

**Solution:**
1. Verify API key is correct in environment variables
2. Check that Maps JavaScript API is enabled in Google Cloud
3. Wait 5-10 minutes after enabling APIs (propagation time)

### Issue: "This API project is not authorized to use this API"

**Cause:** API restrictions too strict or API not enabled

**Solution:**
1. Check API restrictions in Google Cloud Console
2. Ensure all required APIs are enabled
3. Verify domain restrictions match your deployment URL

### Issue: "RefererNotAllowedMapError"

**Cause:** HTTP referrer restrictions don't match your domain

**Solution:**
1. Go to API key settings in Google Cloud
2. Add your domain to allowed referrers:
   - Development: `http://localhost:3000/*`
   - Production: `https://yourdomain.com/*`
3. Use wildcards for subdomains: `https://*.vercel.app/*`

### Issue: Autocomplete not showing suggestions

**Cause:** Places API not enabled or country restriction issue

**Solution:**
1. Enable Places API in Google Cloud Console
2. Check browser console for API errors
3. Verify `componentRestrictions: {country: 'zm'}` in code
4. Test with locations in Zambia

### Issue: Map not loading

**Cause:** Missing Map ID or Advanced Markers API issue

**Solution:**
1. Ensure using `mapId: 'ZEMO_MAP'` in map initialization
2. Advanced Markers require Maps JavaScript API v3.53+
3. Check that `&libraries=places` is in script URL

### Issue: Cron job not running

**Cause:** Vercel cron configuration or CRON_SECRET issue

**Solution:**
1. Verify `vercel.json` has cron configuration
2. Check `CRON_SECRET` environment variable is set
3. Deploy changes to Vercel
4. Check Vercel deployment logs for cron execution
5. Manually test: `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/cron/check-late-returns`

### Issue: High API costs

**Google Cloud Free Tier:**
- $200 monthly credit (covers ~28,000 map loads or 40,000 autocomplete requests)
- After free credit: ~$7 per 1,000 map loads

**Optimization Tips:**
1. Use API key restrictions to prevent unauthorized usage
2. Implement caching for geocoding results
3. Use session tokens for Places Autocomplete (reduces cost by ~83%)
4. Consider map styling to reduce tile loads
5. Monitor usage in Google Cloud Console

## API Usage Estimates

Based on typical usage patterns:

| Feature | Monthly Requests | Cost (after $200 credit) |
|---------|------------------|--------------------------|
| Map Loads | 10,000 | ~$70 |
| Autocomplete | 5,000 | ~$0 (within free tier) |
| Geocoding | 2,000 | ~$10 |
| **Total** | | **~$80/month** |

**Note:** First $200 is free each month, so actual cost = $0 if under credit limit.

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use separate keys** for development and production
3. **Enable API restrictions** to only required APIs
4. **Add domain restrictions** to prevent unauthorized usage
5. **Monitor usage** regularly in Google Cloud Console
6. **Set up billing alerts** to avoid unexpected charges
7. **Rotate keys** periodically (every 6-12 months)

## Support Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)

## Next Steps

After setup is complete:

1. ✅ Test location search functionality
2. ✅ Test map view with vehicle markers
3. ✅ Verify distance calculations are accurate
4. ✅ Test cron job for late returns
5. ✅ Monitor API usage in Google Cloud Console
6. 📝 Document any issues or custom configurations
7. 🚀 Move to Task 10: Comprehensive Testing

---

**Setup Status:** Complete ✅

**Last Updated:** November 29, 2024
