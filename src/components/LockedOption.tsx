import React from "react";
import { Pressable, Text, View } from "react-native";
import { theme } from "../ui/theme";

export default function LockedOption({
  label,
  active,
  locked,
  onPress,
}: {
  label: string;
  active: boolean;
  locked?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: active ? 2 : 1,
        borderColor: active ? theme.accent : theme.border,
        backgroundColor: active ? theme.surface : "transparent",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        opacity: locked ? 0.75 : 1,
      }}
    >
      <Text style={{ color: active ? theme.text : theme.muted, fontWeight: "900" }}>
        {label}
      </Text>
      {locked ? (
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: "rgba(0,0,0,0.06)",
          }}
        >
          <Text style={{ fontWeight: "900" }}>🔒</Text>
        </View>
      ) : null}
    </Pressable>
  );
}
