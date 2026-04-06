import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { MessageCircle } from "lucide-react-native";
import { Image } from "@/src/tw/image";
import { ScreenBackground } from "@/components/ui/screen-background";
import { ChatInput } from "@/components/ui/chat-input";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { INSIGHT_PROMPTS, MOCK_MEMOS } from "@/constants/mock-data";
type ConversationState = "empty" | "thinking" | "searching" | "results";

const MOOD_BREAKDOWN = [
  { label: "Peaceful", percent: 38, width: "76%" as const },
  { label: "Grateful", percent: 27, width: "54%" as const },
  { label: "Stressed", percent: 20, width: "40%" as const },
  { label: "Reflective", percent: 10, width: "20%" as const },
  { label: "Anxious", percent: 5, width: "10%" as const },
];

export default function InsightsScreen() {
  const [state, setState] = useState<ConversationState>("empty");
  const [query, setQuery] = useState("");

  const handleSend = () => {
    if (!query.trim()) return;
    setState("thinking");
    setTimeout(() => setState("searching"), 1500);
    setTimeout(() => setState("results"), 3000);
  };

  const handlePromptPress = (text: string) => {
    setQuery(text);
    setState("thinking");
    setTimeout(() => setState("searching"), 1500);
    setTimeout(() => setState("results"), 3000);
  };

  return (
    <ScreenBackground>
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          gap: 16,
        }}
      >
        {/* Subtitle */}
        <Text
          style={{
            fontFamily: Typography.family.sans,
            fontSize: Typography.size.base,
            color: Colors.secondaryText,
          }}
        >
          {state === "empty"
            ? "Your emotional journey"
            : "Your emotional journey"}
        </Text>

        {/* Chat area */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ gap: 16, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Empty state */}
          {state === "empty" && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 24,
                paddingTop: 40,
              }}
            >
              {/* Illustration */}
              <View
                style={{
                  width: 104,
                  height: 88,
                  borderRadius: 60,
                  backgroundColor: Colors.accentBgLight,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageCircle size={32} color={Colors.primarySubtle} />
              </View>

              <View style={{ alignItems: "center", gap: 8 }}>
                <Text
                  style={{
                    fontFamily: Typography.family.sans,
                    fontSize: Typography.size["3xl"],
                    fontWeight: Typography.weight.bold,
                    color: Colors.textPrimary,
                    textAlign: "center",
                  }}
                >
                  {"What's on your mind?"}
                </Text>
                <Text
                  style={{
                    fontFamily: Typography.family.sans,
                    fontSize: Typography.size.base,
                    color: Colors.secondaryText,
                    textAlign: "center",
                    lineHeight: 21,
                    maxWidth: 280,
                  }}
                >
                  {"I'll look through your entries and reflections to help you see patterns and find perspective."}
                </Text>
              </View>

              {/* Prompt suggestions grid */}
              <View style={{ gap: 10, width: "100%" }}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {INSIGHT_PROMPTS.slice(0, 2).map((prompt) => (
                    <Pressable
                      key={prompt.text}
                      onPress={() => handlePromptPress(prompt.text)}
                      style={({ pressed }) => ({
                        flex: 1,
                        padding: 16,
                        borderRadius: 14,
                        backgroundColor: Colors.glassWhite,
                        borderWidth: 1,
                        borderColor: Colors.accentBorder,
                        gap: 8,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ fontSize: 16 }}>{prompt.emoji}</Text>
                      <Text
                        style={{
                          fontFamily: Typography.family.sans,
                          fontSize: Typography.size.md,
                          fontWeight: Typography.weight.medium,
                          color: Colors.textPrimary,
                          lineHeight: 18,
                        }}
                      >
                        {prompt.text}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {INSIGHT_PROMPTS.slice(2, 4).map((prompt) => (
                    <Pressable
                      key={prompt.text}
                      onPress={() => handlePromptPress(prompt.text)}
                      style={({ pressed }) => ({
                        flex: 1,
                        padding: 16,
                        borderRadius: 14,
                        backgroundColor: Colors.glassWhite,
                        borderWidth: 1,
                        borderColor: Colors.accentBorder,
                        gap: 8,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text style={{ fontSize: 16 }}>{prompt.emoji}</Text>
                      <Text
                        style={{
                          fontFamily: Typography.family.sans,
                          fontSize: Typography.size.md,
                          fontWeight: Typography.weight.medium,
                          color: Colors.textPrimary,
                          lineHeight: 18,
                        }}
                      >
                        {prompt.text}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* User message bubble */}
          {state !== "empty" && (
            <View style={{ alignItems: "flex-end" }}>
              <View
                style={{
                  backgroundColor: Colors.primaryMuted,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 16,
                  borderBottomRightRadius: 4,
                  maxWidth: "85%",
                }}
              >
                <Text
                  style={{
                    fontFamily: Typography.family.sans,
                    fontSize: Typography.size.base,
                    color: Colors.white,
                  }}
                >
                  {query || "How have I been feeling this past week?"}
                </Text>
              </View>
            </View>
          )}

          {/* Thinking state */}
          {state === "thinking" && (
            <View style={{ flexDirection: "row", gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: Colors.primaryMuted,
                    opacity: 0.6,
                  }}
                />
              ))}
            </View>
          )}

          {/* Searching state */}
          {state === "searching" && (
            <View style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 14 }}>{"🔍"}</Text>
                <Text
                  style={{
                    fontFamily: Typography.family.sans,
                    fontSize: Typography.size.base,
                    color: Colors.secondaryText,
                    fontStyle: "italic",
                  }}
                >
                  Looking through your entries...
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.md,
                  color: Colors.textMuted,
                }}
              >
                This may take a moment
              </Text>
            </View>
          )}

          {/* Results state */}
          {state === "results" && (
            <View style={{ gap: 14 }}>
              {/* AI text response */}
              <Text
                selectable
                style={{
                  fontFamily: Typography.family.sans,
                  fontSize: Typography.size.base,
                  color: "#4D5A35",
                  lineHeight: 21,
                }}
              >
                {"You've been trending calmer this week. There was some tension mid-week around deadlines, but overall — you're in a good place."}
              </Text>

              {/* Mood breakdown card */}
              <View
                style={{
                  borderRadius: 14,
                  backgroundColor: Colors.accentBg,
                  borderWidth: 1,
                  borderColor: Colors.accentBorderLight,
                  padding: 14,
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: Typography.family.sans,
                    fontSize: Typography.size.lg,
                    fontWeight: Typography.weight.semibold,
                    color: Colors.textPrimary,
                  }}
                >
                  {"How you've been feeling"}
                </Text>
                {MOOD_BREAKDOWN.map((mood) => (
                  <View
                    key={mood.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: Typography.family.sans,
                        fontSize: Typography.size.md,
                        color: Colors.textPrimary,
                        width: 70,
                      }}
                    >
                      {mood.label}
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: Colors.accentBgLight,
                      }}
                    >
                      <View
                        style={{
                          width: mood.width,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: Colors.primary,
                        }}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: Typography.family.sans,
                        fontSize: Typography.size.md,
                        color: Colors.textMuted,
                        width: 32,
                        textAlign: "right",
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {mood.percent}%
                    </Text>
                  </View>
                ))}
              </View>

              {/* Entry cards */}
              {[
                {
                  time: "9:15 AM",
                  mood: "Peaceful",
                  text: '"Today felt calm... like things were finally under control."',
                  thumb: MOCK_MEMOS[1]?.thumbnailUrl,
                },
                {
                  time: "3:30 PM",
                  mood: "Stressed",
                  text: '"The deadline moved up again. I can feel the tension in my shoulders."',
                  thumb: MOCK_MEMOS[0]?.thumbnailUrl,
                },
              ].map((entry, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    backgroundColor: Colors.glassWhite,
                    borderWidth: 1,
                    borderColor: Colors.accentBorderLight,
                    boxShadow: `0px 2px 8px ${Colors.shadowEntry}`,
                  }}
                >
                  {/* Thumbnail */}
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 10,
                      overflow: "hidden",
                      backgroundColor: Colors.accentBgLight,
                    }}
                  >
                    {entry.thumb && (
                      <Image
                        source={entry.thumb}
                        style={{ width: 56, height: 56 }}
                        contentFit="cover"
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View
                      style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
                    >
                      <Text
                        style={{
                          fontFamily: Typography.family.sans,
                          fontSize: Typography.size.md,
                          fontWeight: Typography.weight.semibold,
                          color: Colors.textPrimary,
                        }}
                      >
                        {entry.time}
                      </Text>
                      <Text
                        style={{
                          fontFamily: Typography.family.sans,
                          fontSize: Typography.size.sm,
                          color: Colors.secondaryText,
                        }}
                      >
                        {entry.mood}
                      </Text>
                    </View>
                    <Text
                      numberOfLines={2}
                      style={{
                        fontFamily: Typography.family.sans,
                        fontSize: Typography.size.md,
                        color: Colors.textPrimary,
                        fontStyle: "italic",
                        lineHeight: 18,
                      }}
                    >
                      {entry.text}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Chat input */}
        <View style={{ paddingBottom: 12 }}>
          <ChatInput
            value={query}
            onChangeText={setQuery}
            onSend={handleSend}
          />
        </View>
      </View>
    </ScreenBackground>
  );
}
