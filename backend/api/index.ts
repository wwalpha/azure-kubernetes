import express from 'express';
import axios from 'axios';

const app = express();

// health check
app.get('/', (_, res) => res.status(200).send());
// public service
app.get('/local', (_, res) => res.send('Hello world'));
// backend auth service
app.get('/auth', async (_, res) => {
  try {
    const response = await axios.get('http://k8s-backend-auth.onecloud.svc.cluster.local:8090/endpoint');

    res.send(response.data);
  } catch (err) {
    console.log(err);
  }
});

// backend worker service
app.get('/worker', async (_, res) => {
  try {
    const response = await axios.get('http://k8s-backend-worker.onecloud.svc.cluster.local:8080/endpoint');

    res.send(response.data);
  } catch (err) {
    console.log(err);
  }
});

app.listen(8080, () => console.log('started at port 8080'));
