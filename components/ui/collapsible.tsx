import { PropsWithChildren, useState } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text } from '@/components/ui';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { colorScheme } = useColorScheme();

  return (
    <View>
      <Pressable
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={colorScheme === 'light' ? '#000' : '#fff'}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <Text className="font-semibold">{title}</Text>
      </Pressable>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
