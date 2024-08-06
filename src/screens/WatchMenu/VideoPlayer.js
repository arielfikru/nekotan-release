import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TouchableWithoutFeedback, Dimensions, BackHandler, StatusBar, Animated, Easing } from 'react-native';
import { Video } from 'expo-av';
import { WebView } from 'react-native-webview';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoPlayer = ({ streamingUrl, onFullscreenChange }) => {
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const videoRef = useRef(null);
  const controlsTimeout = useRef(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      backHandler.remove();
      ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    if (isBuffering) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
      spinValue.stopAnimation();
    }
  }, [isBuffering]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleBackPress = () => {
    if (isFullscreen) {
      toggleFullscreen();
      return true;
    }
    return false;
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
    resetControlsTimeout();
  };

  const onSliderValueChange = async (value) => {
    if (videoRef.current) {
      setIsBuffering(true);
      await videoRef.current.setPositionAsync(value * status.durationMillis);
    }
    resetControlsTimeout();
  };

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setShowControls(true);
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    resetControlsTimeout();
  };

  const toggleFullscreen = async () => {
    const newFullscreenState = !isFullscreen;
    if (newFullscreenState) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    setIsFullscreen(newFullscreenState);
    onFullscreenChange(newFullscreenState);
    StatusBar.setHidden(newFullscreenState);
    resetControlsTimeout();
  };

  const seekVideo = async (seconds) => {
    if (videoRef.current && status.positionMillis !== undefined && status.durationMillis !== undefined) {
      setIsBuffering(true);
      const newPosition = Math.max(0, Math.min(status.positionMillis + seconds * 1000, status.durationMillis));
      await videoRef.current.setPositionAsync(newPosition);
    }
    resetControlsTimeout();
  };

  const backwardTenSeconds = () => seekVideo(-10);
  const forwardTenSeconds = () => seekVideo(10);

  const formatTime = (timeInMilliseconds) => {
    const totalSeconds = Math.floor(timeInMilliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!streamingUrl) {
    return (
      <View style={styles.noStreamingContainer}>
        <Text style={styles.noStreamingText}>Maaf, Anime ini tidak Support Streaming untuk saat ini</Text>
      </View>
    );
  }

  const videoStyle = isFullscreen
    ? { width: SCREEN_HEIGHT, height: SCREEN_WIDTH }
    : { width: SCREEN_WIDTH, height: SCREEN_WIDTH * (9/16) };

  const VideoComponent = streamingUrl.includes('mega.nz') ? WebView : Video;

  return (
    <View style={[styles.videoContainer, isFullscreen && styles.fullscreenContainer]}>
      <TouchableWithoutFeedback onPress={toggleControls}>
        <View>
          <VideoComponent
            ref={videoRef}
            source={{ uri: streamingUrl }}
            style={videoStyle}
            resizeMode={isFullscreen ? "contain" : "cover"}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={status => {
              setStatus(() => status);
              setIsBuffering(status.isBuffering);
            }}
          />
          {showControls && (
            <View style={styles.controlsOverlay}>
              <View style={styles.topControls}>
                <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
                  <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.centerControls}>
                <TouchableOpacity onPress={backwardTenSeconds} style={styles.seekButton}>
                  <Ionicons name="play-back" size={40} color="#fff" />
                  <Text style={styles.seekText}>10s</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
                  {isBuffering ? (
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Ionicons name="sync" size={50} color="#fff" />
                    </Animated.View>
                  ) : (
                    <Ionicons name={status.isPlaying ? "pause" : "play"} size={50} color="#fff" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={forwardTenSeconds} style={styles.seekButton}>
                  <Ionicons name="play-forward" size={40} color="#fff" />
                  <Text style={styles.seekText}>10s</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.bottomControls}>
                <Text style={styles.timeText}>{formatTime(status.positionMillis || 0)}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={status.positionMillis / status.durationMillis || 0}
                  onValueChange={onSliderValueChange}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#000000"
                  thumbTintColor="#FFFFFF"
                />
                <Text style={styles.timeText}>{formatTime(status.durationMillis || 0)}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};


const styles = StyleSheet.create({
  videoContainer: {
    backgroundColor: '#000',
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenButton: {
    padding: 5,
  },
  playPauseButton: {
    padding: 20,
  },
  seekButton: {
    padding: 20,
    alignItems: 'center',
  },
  seekText: {
    color: '#fff',
    fontSize: 12,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    minWidth: 40,
  },
  noStreamingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noStreamingText: {
    fontSize: 16,
    color: '#f4511e',
    textAlign: 'center',
  },
});

export default VideoPlayer;