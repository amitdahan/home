import Docker, { ContainerInfo } from 'dockerode';

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_URL })

export interface Container {
  id: ContainerInfo['Id'];
  names: ContainerInfo['Names'];
  image: ContainerInfo['Image'];
  status: ContainerInfo['Status'];
  state: ContainerInfo['State'];
}

export default async (req, res) => {
  const containers: Container[] = (await docker.listContainers()).map((container) => ({
    id: container.Id,
    names: container.Names,
    image: container.Image,
    status: container.Status,
    state: container.State,
  }))



  res.status(200).json(
    
    );
}
