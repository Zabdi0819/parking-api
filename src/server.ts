import app from './app';
import { initializeDB } from './config/data-source';

const PORT = process.env.PORT || 3000;

initializeDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`GraphQL playground at http://localhost:${PORT}/graphql`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
