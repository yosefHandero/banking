# Quick Start: Fixing Database Configuration Errors

If you're seeing the error: **"Database configuration error. Please check your Appwrite collection schema."**

## Quick Fix Steps

1. **Check your `.env.local` file exists** in the root directory
   - If it doesn't exist, see `ENV_SETUP.md` for setup instructions

2. **Verify your Appwrite collections have the correct schema**
   - See `APPWRITE_SCHEMA.md` for the complete schema requirements
   - Most common issue: Missing attributes in collections

3. **Check the error message details**
   - The error will tell you which attribute is missing
   - Add that attribute to your Appwrite collection with the correct type

## Common Issues

### Issue: "Unknown attribute: accountDetails"
**Solution:** Add a `accountDetails` attribute (String type) to your ACCOUNTS collection, OR remove it from the code if you don't need it.

### Issue: "Collection not found"
**Solution:** 
- Verify collection IDs in `.env.local` match your Appwrite collections
- Check that collections exist in your Appwrite database

### Issue: "Missing required environment variable"
**Solution:** 
- Create `.env.local` file in root directory
- Add all required variables (see `ENV_SETUP.md`)
- Restart your development server

## Need Help?

1. Check `APPWRITE_SCHEMA.md` for complete schema documentation
2. Check `ENV_SETUP.md` for environment setup guide
3. Verify your Appwrite console shows all collections exist
4. Check that attribute types match exactly (String vs Integer vs Double vs DateTime)

