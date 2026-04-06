import { View, TextInput, Pressable } from "react-native";
import { ArrowUp } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

interface ChatInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSend?: () => void;
}

export function ChatInput({
  placeholder = "Ask about your feelings...",
  value,
  onChangeText,
  onSend,
}: ChatInputProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          flex: 1,
          height: 44,
          borderRadius: 22,
          backgroundColor: Colors.glassWhite,
          borderWidth: 1,
          borderColor: Colors.accentBorder,
          justifyContent: "center",
          paddingHorizontal: 16,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textFaint}
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.base,
            color: Colors.textPrimary,
          }}
        />
      </View>
      <Pressable
        onPress={onSend}
        style={({ pressed }) => ({
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: Colors.primaryMuted,
          alignItems: "center",
          justifyContent: "center",
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <ArrowUp size={18} color={Colors.white} />
      </Pressable>
    </View>
  );
}
