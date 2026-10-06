import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { ScreenHeader } from '../components/ui';
import { getCustomer } from '../lib/customers';
import { getCustomerMessages, saveLocalMessage } from '../lib/db';

interface ChatLogScreenProps {
  customerId: number;
  onBack: () => void;
}

interface MessageRow {
  id: number;
  body: string;
  sender: 'tailor' | 'client';
  channel: 'whatsapp' | 'sms';
  sent_at: string;
}

export default function ChatLogScreen({ customerId, onBack }: ChatLogScreenProps) {
  const [customerName, setCustomerName] = useState('Client Message Feed');
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [inputText, setInputText] = useState('');
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    try {
      const client = getCustomer(customerId);
      if (client) {
        setCustomerName(client.name);
      }
      loadChats();
    } catch (err) {
      console.error('Error executing initial conversation loading context:', err);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const loadChats = () => {
    const history = getCustomerMessages(customerId);
    setMessages(history || []);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    try {
      saveLocalMessage(customerId, inputText.trim(), 'tailor', activeChannel);
      setInputText('');
      loadChats();
      
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (err) {
      console.error('Failed execution cycle processing chat logging transaction:', err);
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const parts = isoString.split(' ');
      if (parts.length > 1) {
        return parts[1] ? parts[1].substring(0, 5) : '';
      }
      return isoString.substring(11, 16);
    } catch {
      return '';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenHeader title={customerName} onBack={onBack} />

      {loading ? (
        <View style={styles.centerSpinner}>
          <ActivityIndicator size="small" color={colors.indigo} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chatScrollBody}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isTailor = item.sender === 'tailor';
            return (
              <View style={[styles.bubbleWrapper, isTailor ? styles.bubbleRight : styles.bubbleLeft]}>
                <View style={[
                  styles.messageBubble, 
                  isTailor ? styles.tailorBubbleStyle : styles.clientBubbleStyle
                ]}>
                  <Text style={[styles.bubbleText, isTailor ? styles.tailorText : styles.clientText]}>
                    {item.body}
                  </Text>
                  
                  <View style={styles.bubbleMetaLine}>
                    <Text style={[styles.metaTimeText, isTailor ? styles.tailorMetaTime : styles.clientMetaTime]}>
                      {formatTime(item.sent_at)}
                    </Text>
                    {isTailor && (
                      <MaterialIcons 
                        name={item.channel === 'whatsapp' ? 'chat' : 'smartphone'} 
                        size={11} 
                        color="rgba(255,255,255,0.6)" 
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyFeedBox}>
              <View style={styles.iconRing}>
                <MaterialIcons name="forum" size={28} color={colors.muted} />
              </View>
              <Text style={styles.emptyTitle}>Start Conversation Thread</Text>
              <Text style={styles.emptySub}>
                Type a style update, pattern correction draft note, or balance due request down below to log outbound texts.
              </Text>
            </View>
          }
        />
      )}

      {/* --- CHANNEL SELECTION PILL BAR --- */}
      <View style={styles.gatewayChannelRow}>
        <Pressable 
          style={[styles.channelPill, activeChannel === 'whatsapp' && styles.channelPillActiveWhatsApp]}
          onPress={() => setActiveChannel('whatsapp')}
        >
          <MaterialIcons name="chat" size={14} color={activeChannel === 'whatsapp' ? colors.white : colors.muted} />
          <Text style={[styles.channelText, activeChannel === 'whatsapp' && styles.channelTextActive]}>WhatsApp</Text>
        </Pressable>

        <Pressable 
          style={[styles.channelPill, activeChannel === 'sms' && styles.channelPillActiveSMS]}
          onPress={() => setActiveChannel('sms')}
        >
          <MaterialIcons name="smartphone" size={14} color={activeChannel === 'sms' ? colors.white : colors.muted} />
          <Text style={[styles.channelText, activeChannel === 'sms' && styles.channelTextActive]}>SMS</Text>
        </Pressable>
      </View>

      {/* --- SAFE DISPLACED INPUT ACTION DOCK CONTAINER --- */}
      <View style={styles.inputDockContainer}>
        <View style={styles.inputInnerWrapper}>
          <TextInput
            style={styles.chatInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Message via ${activeChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}...`}
            placeholderTextColor={colors.muted}
            multiline
          />
          <Pressable 
            style={[styles.sendCircleButton, !inputText.trim() && styles.sendCircleDisabled]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <MaterialIcons name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  centerSpinner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chatScrollBody: { flexGrow: 1, padding: 16, paddingBottom: 24 },
  bubbleWrapper: { flexDirection: 'row', marginBottom: 10, width: '100%' },
  bubbleLeft: { justifyContent: 'flex-start' },
  bubbleRight: { justifyContent: 'flex-end' },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  clientBubbleStyle: { backgroundColor: colors.white, borderTopLeftRadius: 4, borderWidth: 1, borderColor: colors.line },
  tailorBubbleStyle: { backgroundColor: colors.indigo, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  clientText: { color: colors.ink },
  tailorText: { color: colors.white },
  bubbleMetaLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  metaTimeText: { fontSize: 10, fontWeight: '500' },
  clientMetaTime: { color: colors.muted },
  tailorMetaTime: { color: 'rgba(255,255,255,0.7)' },
  gatewayChannelRow: {
    flexDirection: 'row',
    backgroundColor: '#F3EFE8',
    padding: 4,
    marginHorizontal: 16,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  channelPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: 8, gap: 6 },
  channelPillActiveWhatsApp: { backgroundColor: '#10B981' },
  channelPillActiveSMS: { backgroundColor: colors.indigo },
  channelText: { fontSize: 12, fontWeight: '600', color: colors.muted },
  channelTextActive: { color: colors.white },
  
  // ADJUSTED CONTAINER BOTTOM PADDING OFFSET
  inputDockContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: colors.cream,
    paddingBottom: Platform.OS === 'android' ? 36 : 28, // Safely clears Android system keys completely
  },
  inputInnerWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 4 },
  chatInput: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 8, marginRight: 8 },
  sendCircleButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.indigo, alignItems: 'center', justifyContent: 'center' },
  sendCircleDisabled: { opacity: 0.4 },
  emptyFeedBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, marginTop: 60 },
  iconRing: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.ink, marginBottom: 4 },
  emptySub: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
