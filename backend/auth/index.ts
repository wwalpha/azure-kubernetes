import express from 'express';

const app = express();

// health check
app.get('/', (_, res) => res.status(200).send());
// private endpoint
app.get('/endpoint', async (_, res) => {
  try {
    const podId = process.env.POD_ID;

    res.send(`Pod ID: ${podId}`);
  } catch (err) {
    console.log(err);
    res.send('private task2');
  }
});

app.listen(8090, () => console.log('started at port 8090'));
