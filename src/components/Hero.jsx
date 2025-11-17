import Spline from '@splinetool/react-spline';

const SCENE_URL = 'https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode';

export default function Hero() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white" aria-label="3D keyboard scene">
      <Spline scene={SCENE_URL} />
    </div>
  );
}
