# 🚀 Supabase + Knowbook Integration Setup Guide

## 📋 **Current Status**

✅ **Supabase Authentication is fully implemented**
- Login/Signup components
- Email verification flow  
- Session management
- Route protection

❌ **Missing Configuration**
- Environment variables
- Knowbook API integration
- API key storage

## 🔧 **Step-by-Step Setup**

### **Step 1: Create Supabase Project**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Choose your organization
4. Set project name: `knowbook-canvas`
5. Set database password (save this!)
6. Choose region closest to you
7. Click **"Create new project"**

### **Step 2: Get Supabase Credentials**

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public key** (starts with `eyJ`)

### **Step 3: Configure Authentication**

1. Go to **Authentication** → **Providers**
2. **Enable Email provider**
3. **Enable "Confirm email"** (important!)
4. Optionally enable GitHub/Google OAuth

### **Step 4: Create Environment File**

Create `apps/web/.env` with these variables:

```bash
# =============================================================================
# SUPABASE AUTHENTICATION (REQUIRED)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# =============================================================================
# KNOWBOOK API INTEGRATION (REQUIRED)
# =============================================================================
KNOWBOOK_API_URL=http://localhost:8000/api/v1
KNOWBOOK_ADMIN_API_KEY=your-admin-api-key-from-knowbook-api

# =============================================================================
# LLM PROVIDERS (At least one required)
# =============================================================================
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# =============================================================================
# LANGGRAPH (REQUIRED)
# =============================================================================
LANGCHAIN_API_KEY=your-langchain-api-key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=knowbook-canvas

# =============================================================================
# OPTIONAL SERVICES
# =============================================================================
GOOGLE_API_KEY=your-google-genai-key
FIREWORKS_API_KEY=your-fireworks-key
GROQ_API_KEY=your-groq-key
FIRECRAWL_API_KEY=your-firecrawl-key
EXA_API_KEY=your-exa-search-key

# Optional: Separate Supabase for documents
NEXT_PUBLIC_SUPABASE_URL_DOCUMENTS=https://your-docs-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY_DOCUMENTS=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔗 **Knowbook API Integration Plan**

### **What We Need to Implement**

1. **Account Creation Flow**:
   ```
   User signs up in Supabase → Create account in Knowbook API → Store API key
   ```

2. **API Key Management**:
   - Store Knowbook API key securely in Supabase user metadata
   - Retrieve API key for authenticated requests
   - Handle API key rotation/updates

3. **Integration Points**:
   - Modify signup action to call Knowbook API
   - Add API key storage to user profile
   - Create Knowbook API client utilities

### **Implementation Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Supabase      │    │  Knowbook Canvas │    │  Knowbook API   │
│   Auth          │    │  (Frontend)      │    │  (Backend)      │
├─────────────────┤    ├──────────────────┤    ├─────────────────┤
│ • User signup   │───▶│ • Signup action  │───▶│ • Create user   │
│ • Email verify  │    │ • Store API key  │    │ • Return API key│
│ • Session mgmt  │    │ • Auth context   │    │ • User profile  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🛠 **Next Implementation Steps**

### **Phase 1: Environment Setup** ✅
- [x] Create configuration guide
- [ ] You provide Supabase credentials
- [ ] Test basic authentication

### **Phase 2: Knowbook API Integration**
- [ ] Create Knowbook API client
- [ ] Modify signup flow to create Knowbook account
- [ ] Store API key in user metadata
- [ ] Add API key retrieval utilities

### **Phase 3: User Experience**
- [ ] Add loading states during account creation
- [ ] Handle API errors gracefully
- [ ] Add API key management UI
- [ ] Test complete flow

## 📝 **What You Need to Provide**

1. **Supabase Credentials** (after creating project):
   - Project URL
   - Anon public key

2. **Knowbook API Details**:
   - API endpoint URL (probably `http://localhost:8000/api/v1`)
   - Admin API key for creating accounts
   - User creation endpoint documentation

3. **LLM API Keys** (at least one):
   - OpenAI API key, or
   - Anthropic API key

4. **LangChain API Key**:
   - For LangGraph agent functionality

## 🚀 **Ready to Proceed**

Once you provide the Supabase credentials, I can:
1. Test the authentication flow
2. Implement the Knowbook API integration
3. Create the complete user onboarding experience

The authentication infrastructure is already solid - we just need configuration and the Knowbook API bridge! 🎯
