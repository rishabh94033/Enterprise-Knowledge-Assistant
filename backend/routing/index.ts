import confluencerouter from './confluence/index';
import express from 'express';
import embeddingrouter from './db/embedding';

const app = express();

app.use(express.json());
app.use('/confluence', confluencerouter);
app.use('/embedding',embeddingrouter)
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

