import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import Hls from 'hls.js';
import styled from 'styled-components';
import { blurInit } from '../../programs/blur/blur';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webglRef = useRef<HTMLCanvasElement>(null);

  const [playing, setPlaying] = useState(false);
  const hls = useMemo(() => new Hls({ enableWorker: false }), []);

  // load media
  React.useEffect(() => {
    console.log('media', videoRef);
    if (videoRef.current) {
      console.log('here');
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
        blurInit(gl);
      }
    }
  })

  const computeFrame = useCallback(() => {
    const ctx = canvasRef.current && canvasRef.current.getContext('2d');
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, 600, 300);
      // const frame = ctx.getImageData(0, 0, 600, 300);
      // console.log({ frame });
    }
  }, [videoRef, canvasRef]);

  useEffect(() => {
    if (playing) {
      const fps = 30;
      const interval = setInterval(computeFrame, 1000 / fps);

      return () => clearInterval(interval);
    }
  }, [playing])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('play', () => setPlaying(true));
      videoRef.current.addEventListener('pause', () => setPlaying(false));
    }

  }, [computeFrame]);

  return (
    <Container>
      <DisplayItem>
        <h3>Source</h3>
        <video ref={videoRef} controls width="600" height="300" />
      </DisplayItem>
      <DisplayItem>
        <h3>Canvas</h3>
        <canvas ref={canvasRef} width="600" height="300" />
      </DisplayItem>
      <DisplayItem>
        <h3>WebGL</h3>
        <canvas ref={webglRef} width="600" height="300" />
      </DisplayItem>
    </Container>
  );
}