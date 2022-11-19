import { Job, Queue, Worker } from 'bullmq'
import { mailJobs } from '../jobs/mail-jobs'

const mailQueue = new Queue('mail', {
  connection: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT as string)
  }
})

const mailWorker = new Worker(
  'mail',
  async (currentJob: Job) => {
    for await (const job of mailJobs) {
      if (job.jobName === currentJob.name) {
        await new job(currentJob.data).handle()
      }
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT as string)
    }
  }
)

export { mailQueue, mailWorker }
