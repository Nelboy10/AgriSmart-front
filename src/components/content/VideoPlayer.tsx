import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url?: string;
  file?: string;
}

export default function VideoPlayer({ url, file }: VideoPlayerProps) {
  const videoSource = url || file;

  if (!videoSource) {
    return (
      <div className="bg-gray-100 aspect-video flex items-center justify-center rounded-lg">
        <p className="text-gray-500">Aucune vidéo disponible</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <ReactPlayer
        url={videoSource}
        width="100%"
        height="100%"
        controls
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
    </div>
  );
}