const express= require('express');
const { generateSlug } = require('random-word-slugs');
const {ECSClient, RunTaskCommand }= require('@aws-sdk/client-ecs');
const {Server} = require('socket.io')
const Redis = require('ioredis');



require('dotenv').config();



const app = express();
const PORT = 9000;

const subscriber = new Redis('rediss://default:AVNS_HJFZIQA-2-M_6IcFoz9@redis-19284222-adityasaini10012001-b0a8.a.aivencloud.com:11354')

const io = new Server({ cors: '*'})

io.on('connection', socket => {
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit('message', `Joined ${channel}`)

    })
})

io.listen(9002, ()=> console.log('Socket Server 9002'))


const ecsClient = new ECSClient({
    region:'us-east-1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
});

const config = {
    CLUSTER: 'arn:aws:ecs:us-east-1:351590100077:cluster/build-server',
    TASK: 'arn:aws:ecs:us-east-1:351590100077:task-definition/build-server'
}






app.use(express.json());
app.post('/project', async(req,res)=> {
    const { gitURL, slug } = req.body;
    // console.log(gitURL)
    const projectSlug = slug ?slug : generateSlug();

    // spin the container
    const command = new RunTaskCommand({
        cluster: config.CLUSTER,
        taskDefinition: config.TASK,
        launchType: 'FARGATE',
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                assignPublicIp: 'ENABLED',
                subnets: ['subnet-0a137e8601b7691f6','subnet-03723ce601ed187d8','subnet-04dfa7ddc112511f0'],
                securityGroups: ['sg-076a2465875c3d729']
            }
        },
        overrides: {
            containerOverrides:[
                {
                    name: 'build-server',
                    environment: [
                        {
                            name:'GIT_REPOSITORY__URL', value: gitURL
                        },
                        {
                            name:'PROJECT_ID', value: projectSlug
                        }

                    ]
                }

            ]
        }


    })

    await ecsClient.send(command);

    return res.json({ status: 'queued', data: {projectSlug, url: `http://${projectSlug}.localhost:8000`}})




});

async function initRedisSubscribe() {
    console.log('Subscribed to logs....')
    subscriber.psubscribe('logs:*')
    subscriber.on('pmessage', (pattern, channel, message)=> {
        io.to(channel).emit('message',message)
    })

}

initRedisSubscribe()



app.listen(PORT, ()=> {
    console.log(`api server is running on ... ${PORT}`);

    
})