# Configuração do Firebase

## Passos para configurar o Firebase:

### 1. Criar projeto no Firebase Console
1. Acesse: https://console.firebase.google.com/
2. Clique em "Criar um projeto"
3. Digite um nome para o projeto
4. Aceite os termos e continue
5. Desabilite o Google Analytics (opcional)
6. Clique em "Criar projeto"

### 2. Configurar Authentication
1. No painel do Firebase, clique em "Authentication"
2. Clique em "Começar"
3. Vá na aba "Sign-in method"
4. Habilite "Email/Password"
5. Clique em "Salvar"

### 3. Configurar Firestore Database
1. No painel do Firebase, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Escolha uma localização (ex: us-central1)
5. Clique em "Concluído"

### 4. Obter credenciais do projeto
1. No painel do Firebase, clique na engrenagem ⚙️ (Configurações do projeto)
2. Clique em "Configurações do projeto"
3. Role para baixo até "Seus aplicativos"
4. Clique no ícone da web `</>`
5. Digite um nome para o app
6. Clique em "Registrar app"
7. **Copie as credenciais** que aparecem

### 5. Configurar arquivo .env
Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

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

### 6. Obter credenciais do Admin SDK
1. No painel do Firebase, clique na engrenagem ⚙️
2. Clique em "Configurações do projeto"
3. Vá na aba "Contas de serviço"
4. Clique em "Gerar nova chave privada"
5. Baixe o arquivo JSON
6. Use os valores do JSON para preencher as variáveis do Admin SDK no .env

### 7. Configurar regras do Firestore
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

### 8. Instalar dependências
```bash
npm install firebase firebase-admin
```

### 9. Testar a configuração
Após configurar tudo, reinicie o servidor:
```bash
npm run dev
```

O sistema de autenticação deve funcionar corretamente!

