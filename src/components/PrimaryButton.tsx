import React from "react";
import { Pressable, Text } from "react-native";
import { theme } from "../ui/theme";

export default function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!!disabled}
      style={{
        backgroundColor: disabled ? "#2A3A4D" : theme.accent,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#07101A", fontWeight: "800" }}>{title}</Text>
    </Pressable>
  );
}
