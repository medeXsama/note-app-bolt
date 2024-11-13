import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { nanoid } from 'nanoid';

const __dirname = dirname(fileURLToPath(import.meta.url));

// In-memory storage for notes
const notes = new Map();

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
      files: {
        relativeTo: join(__dirname, 'public')
      }
    }
  });

  await server.register([Inert, Vision]);

  // Serve static files
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
        index: true,
      }
    }
  });

  // API Routes
  server.route([
    {
      method: 'GET',
      path: '/api/notes',
      handler: () => {
        return Array.from(notes.values());
      }
    },
    {
      method: 'POST',
      path: '/api/notes',
      handler: (request, h) => {
        const { title, content } = request.payload;
        const id = nanoid();
        const note = { id, title, content, createdAt: new Date().toISOString() };
        notes.set(id, note);
        return h.response(note).code(201);
      }
    },
    {
      method: 'PUT',
      path: '/api/notes/{id}',
      handler: (request, h) => {
        const { id } = request.params;
        const { title, content } = request.payload;
        
        if (!notes.has(id)) {
          return h.response({ message: 'Note not found' }).code(404);
        }

        const note = notes.get(id);
        const updatedNote = { ...note, title, content };
        notes.set(id, updatedNote);
        return updatedNote;
      }
    },
    {
      method: 'DELETE',
      path: '/api/notes/{id}',
      handler: (request, h) => {
        const { id } = request.params;
        
        if (!notes.has(id)) {
          return h.response({ message: 'Note not found' }).code(404);
        }

        notes.delete(id);
        return h.response().code(204);
      }
    }
  ]);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();