const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, 'chat.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

const admin = {
  id: "admin",
  name: "Grpc_Admin",
  email: "grpc_admin@mail.com",
  status: "ACTIVE",
};

// 🧠 Mémoire pour stocker les messages
const messageHistory = [];

// Méthode GetUser
function getUser(call, callback) {
  const userId = call.request.user_id;
  console.log(`Requête GetUser reçue pour id: ${userId}`);
  const user = { ...admin, id: userId };
  callback(null, { user });
}

// Méthode Chat (streaming bidirectionnel)
function chat(call) {
  console.log("Flux Chat démarré.");

  call.on('data', (chatStreamMessage) => {
    if (chatStreamMessage.chat_message) {
      const msg = chatStreamMessage.chat_message;
      console.log(`Message reçu de ${msg.sender_id}: ${msg.content}`);

      // 📝 Ajouter au tableau d’historique
      messageHistory.push(msg);

      const reply = {
        id: msg.id + "_reply",
        room_id: msg.room_id,
        sender_id: admin.name,
        content: "received at " + new Date().toISOString(),
      };

      call.write({ chat_message: reply });
    }
  });

  call.on('end', () => {
    console.log("Fin du flux Chat.");
    call.end();
  });
}

// ✨ Nouvelle méthode GetChatHistory
function getChatHistory(call, callback) {
  const roomId = call.request.room_id;
  console.log(`Requête GetChatHistory reçue pour room_id: ${roomId}`);

  // Filtrage (optionnel) selon la room
  const messages = roomId
    ? messageHistory.filter(msg => msg.room_id === roomId)
    : messageHistory;

  callback(null, { messages });
}

// Démarrage du serveur gRPC
function main() {
  const server = new grpc.Server();
  server.addService(chatProto.ChatService.service, {
    GetUser: getUser,
    Chat: chat,
    GetChatHistory: getChatHistory,
  });

  const address = '0.0.0.0:50051';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
      console.error("Erreur lors du binding du serveur :", error);
      return;
    }
    console.log(`Serveur gRPC en écoute sur ${address}`);
    server.start();
  });
}

main();
