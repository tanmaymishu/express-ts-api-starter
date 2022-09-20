import app from './app';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { mailQueue } from '@/queues/mail';

const port = process.env.APP_PORT || 3000;

// Set up queue monitoring route.
const serverAdapter = new ExpressAdapter();

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullMQAdapter(mailQueue)],
  serverAdapter: serverAdapter
});

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

// Boot the server.
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
