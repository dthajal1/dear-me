import { useState, useEffect, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { X, Pause, Play, RefreshCw } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";

export default function RecordingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const [cameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // Request mic permission and start recording on mount
  useEffect(() => {
    async function startRecording() {
      if (!micPermission?.granted) {
        const result = await requestMicPermission();
        if (!result.granted) return;
      }

      // Small delay to let camera mount
      setTimeout(async () => {
        if (cameraRef.current) {
          try {
            setIsRecording(true);
            const video = await cameraRef.current.recordAsync();
            // Video recorded (we're not saving it yet)
            console.log("Video recorded:", video?.uri);
          } catch (e) {
            console.log("Recording error:", e);
          }
          setIsRecording(false);
        }
      }, 500);
    }

    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording, isPaused]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStop = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
    router.push("/record/add-notes");
  };

  const handlePause = () => {
    // Pause/resume not supported in this expo-camera version
    // Keeping the UI button for visual consistency
    setIsPaused((p) => !p);
  };

  if (!cameraPermission?.granted) {
    return <View style={{ flex: 1, backgroundColor: Colors.black }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.black }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        mode="video"
      />

      {/* Top controls */}
      <View
        style={{
          position: "absolute",
          top: insets.top + 8,
          left: 20,
          right: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={handleStop}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#FFFFFF22",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} color={Colors.white} />
        </Pressable>

        {/* Recording indicator */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#FF000033",
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 14,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: isPaused ? "#FFFFFF66" : Colors.recordRed,
            }}
          />
          <Text
            style={{
              color: Colors.white,
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              fontWeight: Typography.weight.medium,
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatTime(seconds)}
          </Text>
        </View>
      </View>

      {/* Bottom bar */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 24,
          left: 0,
          right: 0,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Pause/Resume */}
          <Pressable
            onPress={handlePause}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#FFFFFF22",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPaused ? (
              <Play size={18} color={Colors.white} />
            ) : (
              <Pause size={18} color={Colors.white} />
            )}
          </Pressable>

          {/* Stop button */}
          <Pressable
            onPress={handleStop}
            style={({ pressed }) => ({
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#FFFFFF33",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                backgroundColor: Colors.recordRed,
              }}
            />
          </Pressable>

          {/* Flip */}
          <Pressable
            onPress={() =>
              setFacing((f) => (f === "front" ? "back" : "front"))
            }
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#FFFFFF22",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RefreshCw size={16} color={Colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
