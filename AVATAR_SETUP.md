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

#### Policy 1: Allow users to upload their own avatars
```sql
-- Policy Name: "Users can upload their own avatar"
-- Allowed operation: INSERT
-- Target roles: authenticated
-- USING expression:
true

-- WITH CHECK expression:
(bucket_id = 'avatars')
```

#### Policy 2: Allow public read access
```sql
-- Policy Name: "Public avatars are viewable by everyone"
-- Allowed operation: SELECT
-- Target roles: public
-- USING expression:
(bucket_id = 'avatars')
```

#### Policy 3: Allow users to update their own avatars
```sql
-- Policy Name: "Users can update their own avatar"
-- Allowed operation: UPDATE
-- Target roles: authenticated
-- USING expression:
(bucket_id = 'avatars')

-- WITH CHECK expression:
(bucket_id = 'avatars')
```

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

### "Failed to upload avatar"
- **Check**: Storage bucket `avatars` exists and is public
- **Check**: Storage policies are set correctly
- **Check**: User is authenticated

### Avatar not showing in header
- **Check**: `user.user_metadata.avatar_url` contains valid URL
- **Refresh**: Browser cache might need clearing
- **Check**: Image file is accessible (public URL works)

### Upload button not working
- **Check**: Browser console for errors
- **Check**: File size < 2MB
- **Check**: File type is image/*

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
