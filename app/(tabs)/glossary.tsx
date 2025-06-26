import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/Theme';
import { Search, ChevronDown, ChevronRight, Bookmark } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { glossaryTerms } from '@/constants/Glossary';

export default function GlossaryScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [bookmarkedTerms, setBookmarkedTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadBookmarkedTerms();
    }
  }, [user]);

  const loadBookmarkedTerms = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('glossary_bookmarks')
        .select('term_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading bookmarks:', error);
        return;
      }

      const bookmarkedIds = data?.map(bookmark => bookmark.term_id) || [];
      setBookmarkedTerms(bookmarkedIds);
    } catch (error) {
      console.error('Error loading bookmarked terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (termId: string) => {
    if (!user) return;
    
    try {
      const isBookmarked = bookmarkedTerms.includes(termId);
      
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('glossary_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('term_id', termId);

        if (error) {
          console.error('Error removing bookmark:', error);
          return;
        }

        setBookmarkedTerms(prev => prev.filter(id => id !== termId));
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('glossary_bookmarks')
          .insert({
            user_id: user.id,
            term_id: termId
          });

        if (error) {
          console.error('Error adding bookmark:', error);
          return;
        }

        setBookmarkedTerms(prev => [...prev, termId]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const filteredTerms = glossaryTerms.filter(term => 
    term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleTermPress = (termId: string) => {
    setExpandedTerm(expandedTerm === termId ? null : termId);
  };

  interface GlossaryItemProps {
    item: {
      id: string;
      title: string;
      description: string;
      example?: string;
    };
  }

  const renderGlossaryItem = ({ item }: GlossaryItemProps) => {
    const isBookmarked = bookmarkedTerms.includes(item.id);

    return (
      <TouchableOpacity 
        style={styles.termCard}
        onPress={() => handleTermPress(item.id)}
      >
        <View style={styles.termHeader}>
          <View style={styles.termTitleContainer}>
            <Text style={styles.termTitle}>{item.title}</Text>
          </View>
          <View style={styles.termActions}>
            {user && (
              <TouchableOpacity 
                style={[styles.bookmarkButton, isBookmarked && styles.bookmarkButtonActive]}
                onPress={() => toggleBookmark(item.id)}
              >
                <Bookmark 
                  size={20} 
                  color={isBookmarked ? Colors.accent.yellow : Colors.text.tertiary}
                  fill={isBookmarked ? Colors.accent.yellow : 'transparent'}
                />
              </TouchableOpacity>
            )}
            {expandedTerm === item.id ? (
              <ChevronDown color={Colors.text.secondary} size={20} />
            ) : (
              <ChevronRight color={Colors.text.secondary} size={20} />
            )}
          </View>
        </View>
        {expandedTerm === item.id && (
          <View style={styles.termContent}>
            <Text style={styles.termDescription}>{item.description}</Text>
            {item.example && (
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleTitle}>Example:</Text>
                <Text style={styles.exampleText}>{item.example}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Glossary</Text>
        <Text style={styles.subtitle}>Learn finance from Doughjo </Text>
        {user && bookmarkedTerms.length > 0 && (
          <Text style={styles.bookmarkCount}>
            {bookmarkedTerms.length} term{bookmarkedTerms.length !== 1 ? 's' : ''} bookmarked
          </Text>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Search color={Colors.text.tertiary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search terms..."
          placeholderTextColor={Colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={filteredTerms}
        renderItem={renderGlossaryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No terms found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.xxl,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
  },
  bookmarkCount: {
    fontFamily: 'Inter-Medium',
    fontSize: FONT_SIZE.sm,
    color: Colors.accent.teal,
    marginTop: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.full,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  termCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  termHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  termTitleContainer: {
    flex: 1,
  },
  termTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.md,
    color: Colors.text.primary,
  },
  termActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bookmarkButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  bookmarkButtonActive: {
    backgroundColor: Colors.accent.yellow + '20',
  },
  termContent: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.background.tertiary,
  },
  termDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  exampleContainer: {
    marginTop: SPACING.md,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  exampleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.primary,
    marginBottom: SPACING.xs,
  },
  exampleText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.sm,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: FONT_SIZE.md,
    color: Colors.text.secondary,
  },
});