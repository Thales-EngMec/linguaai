# 🌍 LinguaAI — Guia de Publicação Completo
## Stack 100% gratuita: Groq + Supabase + Vercel

---

## PASSO 1 — Criar conta no Groq (IA gratuita)

1. Acesse: https://console.groq.com
2. Crie uma conta gratuita
3. Vá em **"API Keys"** → **"Create API Key"**
4. Copie a chave (começa com `gsk_...`)
5. Guarde em lugar seguro

---

## PASSO 2 — Criar conta no Supabase (banco de dados)

1. Acesse: https://supabase.com → **"Start for free"**
2. Crie uma conta e clique em **"New project"**
3. Dê um nome: `linguaai` — escolha uma região próxima ao Brasil
4. Defina uma senha forte para o banco
5. Aguarde ~2 minutos para criar

### Configurar o banco de dados:

6. No painel do Supabase, clique em **"SQL Editor"** (ícone de banco de dados)
7. Cole e execute este SQL:

```sql
-- Tabela de perfis dos usuários
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  lang TEXT DEFAULT 'en',
  level INTEGER DEFAULT 0,
  age TEXT,
  profession TEXT,
  goals TEXT,
  interests TEXT,
  reasons TEXT[],
  sports TEXT[],
  movies TEXT[],
  personality TEXT[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de controle de uso diário
CREATE TABLE usage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Políticas de segurança
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own usage" ON usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can manage usage" ON usage FOR ALL USING (true);
```

8. Clique em **"Run"** (ícone ▶️)

### Pegar as chaves do Supabase:

9. Vá em **Settings** → **API**
10. Copie:
    - **Project URL** → `https://xxxx.supabase.co`
    - **anon / public key** → chave longa começando com `eyJ...`
    - **service_role key** → outra chave (guarde com segredo!)

---

## PASSO 3 — Configurar o código

### No arquivo `public/index.html`:

Encontre estas linhas no início do `<script>`:

```javascript
const CONFIG = {
  SUPABASE_URL: 'COLE_SUA_SUPABASE_URL_AQUI',
  SUPABASE_ANON_KEY: 'COLE_SUA_SUPABASE_ANON_KEY_AQUI',
  API_BASE: '',
};
```

Substitua pelos valores do passo 2.

---

## PASSO 4 — Criar conta no GitHub

1. Acesse: https://github.com → crie uma conta
2. Clique em **"New repository"**
3. Nome: `linguaai`
4. Deixe como **Public**
5. Clique em **"Create repository"**

### Subir os arquivos:

6. Na página do repositório, clique em **"uploading an existing file"**
7. Faça upload de TODOS os arquivos desta pasta:
   - `vercel.json`
   - `package.json`
   - `api/chat.js`
   - `api/profile.js`
   - `public/index.html`

> ⚠️ Mantenha a estrutura de pastas: `api/` e `public/`

---

## PASSO 5 — Publicar no Vercel (hospedagem gratuita)

1. Acesse: https://vercel.com → **"Sign up with GitHub"**
2. Clique em **"New Project"**
3. Selecione seu repositório `linguaai`
4. Clique em **"Deploy"** — aguarde ~1 minuto

### Adicionar variáveis de ambiente:

5. Vá em **Settings** → **Environment Variables**
6. Adicione estas 3 variáveis:

| Nome | Valor |
|------|-------|
| `GROQ_API_KEY` | Sua chave do Groq (`gsk_...`) |
| `SUPABASE_URL` | URL do Supabase (`https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Service role key do Supabase |

7. Após adicionar, vá em **Deployments** → clique nos 3 pontinhos → **"Redeploy"**

---

## PASSO 6 — Configurar domínio (opcional)

- O Vercel já dá um domínio gratuito: `linguaai.vercel.app`
- Para um domínio próprio (ex: `linguaai.com.br`): compre em https://registro.br e configure no painel Vercel → **Domains**

---

## ✅ Pronto! Seu site está no ar

Acesse `https://linguaai.vercel.app` e compartilhe com o mundo!

---

## 📊 Limites gratuitos

| Serviço | Limite gratuito |
|---------|----------------|
| Groq | ~14.400 chamadas/dia (muito generoso!) |
| Supabase | 500MB banco, 50.000 usuários |
| Vercel | 100GB bandwidth/mês |

**Com esses limites você consegue ter centenas de usuários simultâneos sem pagar nada.**

---

## 🔧 Dúvidas comuns

**"Build failed" no Vercel?**
→ Verifique se todos os arquivos foram subidos com a estrutura correta

**Usuários não conseguem fazer login?**
→ No Supabase, vá em Authentication → Settings → confirme que Email está habilitado

**API retorna erro 500?**
→ Verifique se as variáveis de ambiente estão corretas no Vercel

---

Feito com ❤️ — LinguaAI
