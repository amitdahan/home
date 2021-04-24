import Head from 'next/head'
import { useQuery } from 'react-query'
import styles from '../styles/Home.module.css'
import { Container } from './api/projects';

export default function Home() {
  const { isLoading, error, data } = useQuery<Container[]>(
    'projects', 
    () => fetch('/api/projects').then(res => res.json())
  );

  if (isLoading) {
    return 'Loading...';
  }

  if (error) {
    return (
      <div>
        An error has occurred!
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Home
        </h1>

        {data.map(container => (
          <div key={container.id}>
            {container.names.join(', ')} ({container.image}) - {container.status}
          </div>
        ))}
      </main>
    </div>
  );
};
