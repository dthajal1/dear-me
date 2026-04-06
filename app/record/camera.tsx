import { useState, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { X, RefreshCw } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function CameraReadyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: Colors.black }} />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.black,
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: 24,
        }}
      >
        <Text
          style={{
            color: Colors.white,
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.lg,
            fontWeight: Typography.weight.semibold,
            textAlign: "center",
          }}
        >
          Camera access needed
        </Text>
        <Text
          style={{
            color: "#ffffff88",
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.base,
            textAlign: "center",
          }}
        >
          We need your camera to record memos.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{
            backgroundColor: Colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 24,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.base,
              fontWeight: Typography.weight.semibold,
            }}
          >
            Grant Permission
          </Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={{ marginTop: 8 }}>
          <Text
            style={{
              color: "#ffffff66",
              fontFamily: Typography.family.sans,
              fontSize: Typography.size.sm,
            }}
          >
            Go back
          </Text>
        </Pressable>
      </View>
    );
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
        {/* Close */}
        <Pressable
          onPress={() => router.back()}
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

        {/* Flip camera */}
        <Pressable
          onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#FFFFFF22",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RefreshCw size={16} color={Colors.white} />
        </Pressable>
      </View>

      {/* Bottom bar */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 24,
          left: 0,
          right: 0,
          alignItems: "center",
          gap: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 40,
          }}
        >
          {/* Timer */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#FFFFFF22",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontFamily: Typography.family.sans,
                fontSize: Typography.size.md,
                fontWeight: Typography.weight.medium,
              }}
            >
              2m
            </Text>
          </View>

          {/* Record button */}
          <Pressable
            onPress={() => router.push("/record/recording")}
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
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: Colors.recordRed,
              }}
            />
          </Pressable>

          {/* Effects */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#FFFFFF22",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: 18,
              }}
            >
              {"✦"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
