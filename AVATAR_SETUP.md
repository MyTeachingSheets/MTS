# Profile Picture Upload - Setup Guide

## Overview
Users can upload and update their profile pictures. Images are stored in Supabase Storage and displayed in the header and profile page.

---

## 🔧 Supabase Storage Setup (One-Time)

### 1. Create Storage Bucket
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name: `avatars`
5. **Public bucket**: ✅ YES (check this box)
6. Click **Create bucket**

### 2. Set Storage Policies
Go to the **Policies** tab for the `avatars` bucket and add these policies:

⚠️ **IMPORTANT**: Delete any existing policies first, then add these exact ones:

#### Policy 1: Allow authenticated users to upload
```sql
-- Policy Name: "Users can upload their own avatar"
-- Allowed operation: INSERT
-- Target roles: authenticated
-- Policy definition:
true
```
In the UI:
- **Policy command**: INSERT
- **Target roles**: authenticated
- **WITH CHECK expression**: `true`
- Leave USING expression empty for INSERT

#### Policy 2: Allow public read access (CRITICAL - Don't skip!)
```sql
-- Policy Name: "Public avatars are viewable by everyone"
-- Allowed operation: SELECT
-- Target roles**: anon, authenticated
-- Policy definition:
true
```
In the UI:
- **Policy command**: SELECT
- **Target roles**: Select both `anon` AND `authenticated`
- **USING expression**: `true`

#### Policy 3: Allow users to update their avatars
```sql
-- Policy Name: "Users can update their own avatar"
-- Allowed operation: UPDATE
-- Target roles: authenticated
-- Policy definition:
true
```
In the UI:
- **Policy command**: UPDATE
- **Target roles**: authenticated
- **USING expression**: `true`
- **WITH CHECK expression**: `true`

#### Policy 4: Allow users to delete (optional but recommended)
```sql
-- Policy Name: "Users can delete their own avatar"
-- Allowed operation: DELETE
-- Target roles: authenticated
-- Policy definition:
true
```
In the UI:
- **Policy command**: DELETE
- **Target roles**: authenticated
- **USING expression**: `true`

---

## 📸 How It Works

### Upload Process:
1. User goes to `/profile` page
2. Clicks "Change Photo" button
3. Selects an image file (validates: image type, max 2MB)
4. Image uploads to `avatars` bucket in Supabase Storage
5. Public URL is saved to `user.user_metadata.avatar_url`
6. Header automatically updates to show new avatar

### File Storage:
- **Location**: Supabase Storage bucket `avatars`
- **Filename format**: `{user_id}-{timestamp}.{extension}`
- **Example**: `a1b2c3d4-1234567890.jpg`
- **Size limit**: 2MB
- **Allowed types**: All image types (jpg, png, gif, webp, etc.)

### Display Logic:
- **If avatar exists**: Shows `user.user_metadata.avatar_url` image
- **If no avatar**: Shows user's email initial in colored circle

---

## 🚀 Testing the Feature

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Sign in or create account**:
   - Use the auth modal to log in

3. **Go to profile page**:
   - Click your avatar in header → "Profile"
   - Or navigate to `/profile`

4. **Upload avatar**:
   - Click "Change Photo"
   - Select an image (< 2MB)
   - Wait for "Avatar updated successfully!" message

5. **Verify**:
   - Check header shows your new avatar
   - Refresh page - avatar should persist
   - Click avatar to open dropdown

---

## 🎨 Styling

### Profile Page Avatar Section:
- Large circular avatar (120px)
- Gradient placeholder if no avatar
- Upload button below avatar
- Success/error messages

### Header Avatar:
- Small circular avatar (36px)
- Clickable to open dropdown
- Shows initials if no avatar

---

## 🔒 Security Notes

- ✅ Only authenticated users can upload
- ✅ File type validation (images only)
- ✅ File size validation (max 2MB)
- ✅ Unique filenames prevent overwrites
- ✅ Public read access for avatars
- ✅ User metadata updated server-side

---

## 🐛 Troubleshooting

### ❌ "new row violates row-level security policy" (MOST COMMON)
This means your storage policies are incorrect. **Follow these exact steps**:

1. **Go to Supabase Dashboard** → Storage → `avatars` bucket → Policies tab
2. **DELETE all existing policies**
3. **Add the 4 policies from Section 2 above EXACTLY as written**
4. **Critical checks**:
   - ✅ Bucket must be PUBLIC (not private)
   - ✅ INSERT policy: Target role = `authenticated`, WITH CHECK = `true`
   - ✅ SELECT policy: Target roles = BOTH `anon` AND `authenticated`, USING = `true`
   - ✅ UPDATE policy: Target role = `authenticated`, both expressions = `true`
5. **Test again** - error should be gone

**Quick fix**: Set all policy expressions to just `true` for testing. This allows all operations.

### "Failed to upload avatar"
- **Check**: Storage bucket `avatars` exists and is public
- **Check**: All 4 storage policies are added (see above)
- **Check**: User is authenticated
- **Try**: Browser console (F12) for detailed error message

### Avatar not showing in header
- **Check**: `user.user_metadata.avatar_url` contains valid URL
- **Refresh**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- **Check**: Image file is accessible (copy URL to new tab)
- **Check**: SELECT policy allows public read

### Upload button not working
- **Check**: Browser console for errors
- **Check**: File size < 2MB
- **Check**: File type is image/* (jpg, png, gif, webp)
- **Try**: Different image file

---

## 📝 Files Modified

- `pages/profile.js` - Added upload UI and handler
- `components/Header.js` - Shows avatar in dropdown
- `styles/globals.css` - Avatar and upload button styles

---

## 🎯 Future Enhancements

- [ ] Image cropping before upload
- [ ] Multiple image sizes (thumbnail, medium, large)
- [ ] Delete old avatar when uploading new one
- [ ] Progress bar during upload
- [ ] Drag & drop upload
- [ ] Avatar preview before upload
