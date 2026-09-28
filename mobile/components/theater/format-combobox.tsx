import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "@/constants/theme";
import {
  filterFormatOptions,
  loadAllTheaterFormats,
  saveCustomTheaterFormat,
} from "@/lib/theater-formats";

type FormatComboboxProps = {
  value: string;
  onChange: (format: string) => void;
  label?: string;
};

export function FormatCombobox({
  value,
  onChange,
  label = "Format",
}: FormatComboboxProps) {
  const [allOptions, setAllOptions] = useState<string[]>([]);
  const [query, setQuery] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    void loadAllTheaterFormats().then(setAllOptions);
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = useMemo(
    () => filterFormatOptions(allOptions, query),
    [allOptions, query],
  );

  const trimmedQuery = query.trim();
  const canAddCustom =
    trimmedQuery.length > 0 &&
    !allOptions.some((o) => o.toLowerCase() === trimmedQuery.toLowerCase());

  const showList = focused && (filtered.length > 0 || canAddCustom);

  const selectFormat = async (format: string) => {
    const next = format.trim();
    if (!next) return;
    if (!allOptions.some((o) => o.toLowerCase() === next.toLowerCase())) {
      const updated = await saveCustomTheaterFormat(next);
      setAllOptions(updated);
    }
    onChange(next);
    setQuery(next);
    setFocused(false);
  };

  return (
    <View>
      <Text className="mb-2 text-sm font-medium" style={{ color: colors.textMuted }}>
        {label}
      </Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        onFocus={() => setFocused(true)}
        placeholder="e.g. IMAX 3D"
        placeholderTextColor={colors.textSubtle}
        className="rounded-xl px-4 py-3 text-base"
        style={{
          color: colors.text,
          backgroundColor: colors.surfaceElevated,
        }}
      />

      {showList ? (
        <View
          className="mt-2 overflow-hidden rounded-xl"
          style={{
            backgroundColor: colors.surfaceElevated,
            borderWidth: 1,
            borderColor: colors.border,
            maxHeight: 220,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {canAddCustom ? (
              <Pressable
                onPress={() => void selectFormat(trimmedQuery)}
                className="border-b px-4 py-3"
                style={{ borderColor: colors.border }}
              >
                <Text style={{ color: colors.gold }}>
                  Add &quot;{trimmedQuery}&quot;
                </Text>
              </Pressable>
            ) : null}
            {filtered.map((option) => (
              <Pressable
                key={option}
                onPress={() => void selectFormat(option)}
                className="px-4 py-3"
              >
                <Text style={{ color: colors.text }}>{option}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
