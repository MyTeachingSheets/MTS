# 🔧 QUICK FIX: "row violates row-level security policy"

## ⚡ 3-Step Fix (Takes 2 minutes)

### Step 1: Go to Supabase Storage Policies
1. Open your Supabase project
2. Click **Storage** in left sidebar
3. Click on `avatars` bucket
4. Click **Policies** tab at the top

### Step 2: Delete ALL Existing Policies
- Click the **3 dots (•••)** next to each policy
- Click **Delete**
- Repeat until NO policies remain

### Step 3: Add These 4 NEW Policies

---

#### 📤 **Policy #1: INSERT (Upload)**
```
Click: "New Policy" button
```
- **Policy Name**: `Users can upload avatars`
- **Policy Command**: SELECT `INSERT` from dropdown
- **Target Roles**: Check ✅ `authenticated`
- **WITH CHECK expression**: Type: `true`
- Click **Review** → **Save Policy**

---

#### 👁️ **Policy #2: SELECT (View) - MOST IMPORTANT**
```
Click: "New Policy" button
```
- **Policy Name**: `Public can view avatars`
- **Policy Command**: SELECT `SELECT` from dropdown
- **Target Roles**: Check ✅ **BOTH** `anon` AND `authenticated`
- **USING expression**: Type: `true`
- Click **Review** → **Save Policy**

---

#### ✏️ **Policy #3: UPDATE (Change)**
```
Click: "New Policy" button
```
- **Policy Name**: `Users can update avatars`
- **Policy Command**: SELECT `UPDATE` from dropdown
- **Target Roles**: Check ✅ `authenticated`
- **USING expression**: Type: `true`
- **WITH CHECK expression**: Type: `true`
- Click **Review** → **Save Policy**

---

#### 🗑️ **Policy #4: DELETE (Remove) - Optional**
```
Click: "New Policy" button
```
- **Policy Name**: `Users can delete avatars`
- **Policy Command**: SELECT `DELETE` from dropdown
- **Target Roles**: Check ✅ `authenticated`
- **USING expression**: Type: `true`
- Click **Review** → **Save Policy**

---

## ✅ Verify Setup

After adding policies, you should see:
```
✓ Users can upload avatars (INSERT, authenticated)
✓ Public can view avatars (SELECT, anon + authenticated)
✓ Users can update avatars (UPDATE, authenticated)
✓ Users can delete avatars (DELETE, authenticated)
```

## 🧪 Test It

1. Go to your app: `http://localhost:3000/profile`
2. Click "Change Photo"
3. Select your 8KB jpg image
4. Should see: ✓ "Avatar updated successfully!"
5. Check header - should show your image

---

## ❓ Still Getting Error?

### Double-check these:
1. ✅ Bucket is named exactly `avatars` (lowercase, plural)
2. ✅ Bucket is set to **PUBLIC** (not private)
3. ✅ All 4 policies are added
4. ✅ You're logged in (authenticated user)
5. ✅ Image is valid (jpg, png, gif, webp)

### Last Resort - Nuclear Option:
If still not working, try this simple policy that allows EVERYTHING:

**Create ONE policy:**
- Policy Name: `Allow all`
- All commands: `ALL`
- Target roles: `authenticated`
- USING expression: `true`
- WITH CHECK expression: `true`

This is less secure but will definitely work. Once working, you can refine the policies.

---

## 📞 Need More Help?

Check browser console (F12) for detailed error messages:
- `storage/unauthorized` = policy issue
- `storage/bucket-not-found` = bucket doesn't exist
- `storage/invalid-file-type` = wrong file format

Your 8KB, 100x100px JPG is perfect - problem is 100% the policies! ✨
