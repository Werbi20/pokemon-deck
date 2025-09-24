# Como configurar o arquivo .env

## Passo 1: Criar o arquivo .env

Crie um arquivo chamado `.env` na raiz do projeto (mesmo diretório do package.json) com o seguinte conteúdo:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="sua_api_key_aqui"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="seu_projeto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="seu_projeto_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="seu_projeto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="seu_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="seu_app_id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="seu_measurement_id"

# Firebase Admin SDK (para servidor)
FIREBASE_PROJECT_ID="seu_projeto_id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@seu_projeto.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua_chave_privada_aqui\n-----END PRIVATE KEY-----"

# Desenvolvimento
NEXT_PUBLIC_DISABLE_AUTH=false

# Pokémon TCG API
POKEMON_TCG_API_KEY="your_api_key_here"
```

## Passo 2: Obter as credenciais do Firebase

### Para as variáveis NEXT_PUBLIC_* (cliente):

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto
3. Clique na engrenagem ⚙️ (Configurações do projeto)
4. Clique em "Configurações do projeto"
5. Role para baixo até "Seus aplicativos"
6. Clique no ícone da web `</>`
7. Se não tiver um app web, clique em "Adicionar app" e escolha "Web"
8. Copie as credenciais que aparecem

### Para as variáveis do Admin SDK (servidor):

1. No painel do Firebase, clique na engrenagem ⚙️
2. Clique em "Configurações do projeto"
3. Vá na aba "Contas de serviço"
4. Clique em "Gerar nova chave privada"
5. Baixe o arquivo JSON
6. Use os valores do JSON para preencher:
   - `FIREBASE_PROJECT_ID`: project_id
   - `FIREBASE_CLIENT_EMAIL`: client_email
   - `FIREBASE_PRIVATE_KEY`: private_key (mantenha as quebras de linha)

## Passo 3: Configurar o Firebase

### Authentication:
1. No painel do Firebase, clique em "Authentication"
2. Clique em "Começar"
3. Vá na aba "Sign-in method"
4. Habilite "Email/Password"
5. Clique em "Salvar"

### Firestore Database:
1. No painel do Firebase, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Escolha uma localização (ex: us-central1)
5. Clique em "Concluído"

### Regras do Firestore:
No Firestore, vá em "Regras" e configure:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura/escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Passo 4: Testar a configuração

Após configurar tudo, reinicie o servidor:
```bash
npm run dev
```

O sistema de autenticação deve funcionar corretamente!

## Exemplo de arquivo .env preenchido:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="meu-projeto-pokemon.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="meu-projeto-pokemon"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="meu-projeto-pokemon.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:abcdef1234567890"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Firebase Admin SDK (para servidor)
FIREBASE_PROJECT_ID="meu-projeto-pokemon"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-abc123@meu-projeto-pokemon.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"

# Desenvolvimento
NEXT_PUBLIC_DISABLE_AUTH=false

# Pokémon TCG API
POKEMON_TCG_API_KEY="your_api_key_here"
```

## Importante:

- **NUNCA** commite o arquivo `.env` para o Git
- Mantenha as credenciais seguras
- Use o modo de teste do Firestore apenas para desenvolvimento
- Em produção, configure regras mais restritivas
