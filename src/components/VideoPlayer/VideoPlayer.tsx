import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import Hls from 'hls.js';
import styled from 'styled-components';
import { Convoluter } from '../../programs/convolution/convolution';
import kernels from '../../programs/convolution/kernels';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
const DisplayItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
`;

interface VideoPlayerProps {
}

export const VideoPlayer: React.FC<VideoPlayerProps> = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const webglRef = useRef<HTMLCanvasElement>(null);
  const [render, setRender] = React.useState<Convoluter>();
  const [kernelType, setKernelType] = React.useState<keyof typeof kernels>('normal');
  const [offsetLeft, setOffsetLeft] = React.useState(0);

  const [playing, setPlaying] = useState(false);
  const hls = useMemo(() => new Hls({ enableWorker: false }), []);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 300;
    canvasRef.current = canvas;
  }, []);

  useEffect(() => {
    if (render) {
      render.configure({ type: kernelType, offset: offsetLeft });
    }
  }, [render, kernelType, offsetLeft]);

  // load media
  React.useEffect(() => {
    if (videoRef.current) {
      hls.loadSource('https://stream.mux.com/UomiivCQ6LIzUcdSiebETe01Ik102DRBZL.m3u8');
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('parsed');
      });
    }
  }, [hls])

  useEffect(() => {
    if (webglRef.current) {
      const gl = webglRef.current.getContext('webgl');
      if (gl) {
        const convoluter = new Convoluter(gl, { type: 'normal' });
        setRender(convoluter);
      }
    }
  }, [webglRef]);

  const onCanvasHover = React.useCallback((e: any) => {
    setOffsetLeft(e.clientX - webglRef.current.offsetLeft);
  }, [webglRef]);

  const computeFrame = useCallback(() => {
    const ctx = canvasRef.current && canvasRef.current.getContext('2d');
    if (ctx && videoRef.current) {
      const w = videoRef.current.width;
      const h = videoRef.current.height;
      ctx.drawImage(videoRef.current, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      if (frame) {
        render.draw(frame);
      }
    }
  }, [videoRef, canvasRef, render]);

  useEffect(() => {
    if (playing) {
      const fps = 30;
      const interval = setInterval(computeFrame, 1000 / fps);

      return () => clearInterval(interval);
    }
  }, [playing, computeFrame])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('playing', () => setPlaying(true));
      videoRef.current.addEventListener('pause', () => setPlaying(false));
    }

  }, [videoRef]);

  return (
    <Container>
      <DisplayItem>
        <h3>Source</h3>
        <video ref={videoRef} controls width="600" height="300" />
      </DisplayItem>
      
      <DisplayItem>
        <h3>WebGL</h3>

        <canvas
          ref={webglRef} 
          onMouseMove={onCanvasHover}
          width="600" 
          height="300"
        />

        <div>
          <select value={kernelType} onChange={e => setKernelType(e.target.value as any)}>
            {Object.keys(kernels).map(k => (
              <option>{k}</option>
            ))}
          </select>
        </div>
      </DisplayItem>
    </Container>
  );
}