import Docker from 'dockerode';

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_URL })


export default async (req, res) => {
  const containers = await docker.listContainers();

  res.status(200).json(
    containers.map((container) => ({
      id: container.Id,
      names: container.Names,
      image: container.Image,
      status: container.Status,
      state: container.State,
    }))
  );
}
