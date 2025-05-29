import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Searchbar, Portal, Modal, Button, TextInput } from 'react-native-paper';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { GroupCard } from '@/components/GroupCard';
import { User } from '@/types';
import { AvatarGroup } from '@/components/AvatarGroup';
import { Avatar } from '@/components/Avatar';

export default function GroupsScreen() {
  const { groups, createGroup } = useData();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(false);

  const availableUsers: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' },
  ];

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      setLoading(true);
      await createGroup(newGroupName, selectedUsers, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
      setNewGroupName('');
      setSelectedUsers([]);
      setCreateModalVisible(false);
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Groups</Text>
        <Searchbar
          placeholder="Search groups"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <FlatList
        data={filteredGroups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <GroupCard group={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No groups match your search' : 'No groups yet'}
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => setCreateModalVisible(true)}
      />

      <Portal>
        <Modal
          visible={createModalVisible}
          onDismiss={() => setCreateModalVisible(false)}
          contentContainerStyle={[
            styles.modalContainer,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Text style={styles.modalTitle}>Create New Group</Text>

          <TextInput
            label="Group Name"
            value={newGroupName}
            onChangeText={setNewGroupName}
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Add Members</Text>

          <View style={styles.selectedUsersContainer}>
            {selectedUsers.length > 0 ? (
              <AvatarGroup users={selectedUsers} size={40} maxDisplayed={5} />
            ) : (
              <Text style={styles.hintText}>Select members to add</Text>
            )}
          </View>

          <View style={styles.usersList}>
            {availableUsers.map(availableUser => (
              <View key={availableUser.id} style={styles.userItem}>
                <Avatar user={availableUser} size={40} />
                <Text style={styles.userName}>{availableUser.name}</Text>
                <Button
                  mode={selectedUsers.some(u => u.id === availableUser.id) ? "contained" : "outlined"}
                  onPress={() => toggleUserSelection(availableUser)}
                  style={styles.selectButton}
                >
                  {selectedUsers.some(u => u.id === availableUser.id) ? "Selected" : "Select"}
                </Button>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button mode="outlined" onPress={() => setCreateModalVisible(false)} style={styles.button}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreateGroup}
              loading={loading}
              disabled={!newGroupName.trim() || loading}
              style={styles.button}
            >
              Create
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 40 },
  header: { padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter-Bold', marginBottom: 16 },
  searchBar: { marginBottom: 8, elevation: 2 },
  list: { paddingBottom: 80 },
  emptyContainer: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 16, opacity: 0.6, textAlign: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
  modalContainer: { margin: 20, borderRadius: 8, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: 'Inter-Bold', marginBottom: 16 },
  input: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter-SemiBold', marginBottom: 8 },
  selectedUsersContainer: { flexDirection: 'row', marginBottom: 16, minHeight: 40, alignItems: 'center' },
  hintText: { opacity: 0.6, fontStyle: 'italic' },
  usersList: { maxHeight: 200 },
  userItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  userName: { flex: 1, marginLeft: 12 },
  selectButton: { marginLeft: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  button: { marginLeft: 8 },
});
