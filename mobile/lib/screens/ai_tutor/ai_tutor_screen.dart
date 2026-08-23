import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import '../../providers/academic_provider.dart';
import '../../providers/chat_provider.dart';
import '../../models/module_model.dart';
import '../../models/chat_model.dart';
import '../../theme/app_theme.dart';

class AiTutorScreen extends StatefulWidget {
  const AiTutorScreen({super.key});

  @override
  State<AiTutorScreen> createState() => _AiTutorScreenState();
}

class _AiTutorScreenState extends State<AiTutorScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  ModuleModel? _selectedModule;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final academic = Provider.of<AcademicProvider>(context, listen: false);
      if (academic.modules.isNotEmpty) {
        _onSelectModule(academic.modules.first);
      }
    });
  }

  void _onSelectModule(ModuleModel mod) {
    setState(() => _selectedModule = mod);
    Provider.of<ChatProvider>(context, listen: false).fetchSessions(mod.id);
  }

  void _sendMessage([String? presetText]) {
    final text = presetText ?? _messageController.text;
    if (text.trim().isEmpty || _selectedModule == null) return;

    _messageController.clear();
    Provider.of<ChatProvider>(context, listen: false).sendMessage(_selectedModule!.id, text);

    Future.delayed(const Duration(milliseconds: 200), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final academic = Provider.of<AcademicProvider>(context);
    final chat = Provider.of<ChatProvider>(context);
    final modules = academic.modules;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('AI Tutor'),
        actions: [
          Builder(
            builder: (ctx) => IconButton(
              icon: const Icon(Icons.history_rounded),
              onPressed: () => Scaffold.of(ctx).openEndDrawer(),
            ),
          ),
        ],
      ),
      endDrawer: _buildSessionDrawer(chat),
      body: Column(
        children: [
          // Module Selector Dropdown Header
          Container(
            color: AppTheme.card,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              children: [
                const Icon(Icons.school, size: 20, color: AppTheme.primary),
                const SizedBox(width: 10),
                Expanded(
                  child: modules.isEmpty
                      ? const Text('No modules available', style: TextStyle(color: AppTheme.textSecondary))
                      : DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedModule?.id,
                            isExpanded: true,
                            hint: const Text('Select a module to study'),
                            items: modules.map((m) {
                              return DropdownMenuItem(
                                value: m.id,
                                child: Text(
                                  '${m.moduleCode.isNotEmpty ? "${m.moduleCode} - " : ""}${m.moduleName}',
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              );
                            }).toList(),
                            onChanged: (id) {
                              final mod = modules.firstWhere((m) => m.id == id);
                              _onSelectModule(mod);
                            },
                          ),
                        ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppTheme.cardBorder),

          // Quick Prompt Suggestion Pills
          Container(
            height: 48,
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _promptChip('📝 Summarize main concepts', 'Can you summarize the core concepts of this module?'),
                _promptChip('❓ Practice Quiz', 'Generate a 3-question practice quiz for this subject.'),
                _promptChip('💡 Exam tips', 'What are the most commonly tested topics in this module?'),
              ],
            ),
          ),

          // Message List
          Expanded(
            child: chat.isLoadingMessages
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
                : chat.messages.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                color: AppTheme.primaryLight,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.smart_toy_outlined, size: 32, color: AppTheme.primary),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'How can I help you study today?',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppTheme.textPrimary),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Ask anything about your syllabus, lecture notes, or quizzes.',
                              style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: chat.messages.length,
                        itemBuilder: (context, idx) {
                          final msg = chat.messages[idx];
                          final isUser = msg.role == 'user';

                          return Align(
                            alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.85),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: isUser ? AppTheme.primary : AppTheme.card,
                                borderRadius: BorderRadius.circular(18),
                                border: isUser ? null : Border.all(color: AppTheme.cardBorder),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (!isUser) ...[
                                    Row(
                                      children: [
                                        const Icon(Icons.auto_awesome, size: 14, color: AppTheme.primary),
                                        const SizedBox(width: 4),
                                        Text('AI TUTOR', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppTheme.primary)),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                  ],
                                  MarkdownBody(
                                    data: msg.content,
                                    styleSheet: MarkdownStyleSheet(
                                      p: TextStyle(color: isUser ? Colors.white : AppTheme.textPrimary, fontSize: 14, height: 1.4),
                                      code: TextStyle(backgroundColor: isUser ? Colors.white24 : AppTheme.cardMuted, color: isUser ? Colors.white : AppTheme.primary, fontFamily: 'monospace'),
                                    ),
                                  ),

                                  // Interactive Quiz
                                  if (msg.quiz != null && msg.quiz!.isNotEmpty) ...[
                                    const SizedBox(height: 12),
                                    ...msg.quiz!.map((q) => _buildQuizWidget(q)),
                                  ],
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),

          if (chat.isSending)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: const Row(
                children: [
                  SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primary)),
                  SizedBox(width: 8),
                  Text('AI Tutor is thinking...', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                ],
              ),
            ),

          // Message Input Bar
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: AppTheme.card,
              border: Border(top: BorderSide(color: AppTheme.cardBorder)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Ask a question...',
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(
                  style: IconButton.styleFrom(backgroundColor: AppTheme.primary),
                  onPressed: () => _sendMessage(),
                  icon: const Icon(Icons.send, color: Colors.white, size: 20),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _promptChip(String label, String prompt) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        label: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.textPrimary)),
        backgroundColor: AppTheme.card,
        side: const BorderSide(color: AppTheme.cardBorder),
        onPressed: () => _sendMessage(prompt),
      ),
    );
  }

  Widget _buildQuizWidget(QuizQuestionModel q) {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(q.question, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
          const SizedBox(height: 8),
          ...q.options.asMap().entries.map((entry) {
            final idx = entry.key;
            final option = entry.value;
            final isChosen = q.selectedIndex == idx;
            final isCorrect = q.correctIndex == idx;

            Color btnColor = AppTheme.card;
            if (q.selectedIndex != null) {
              if (isCorrect) btnColor = AppTheme.successLight;
              else if (isChosen && !isCorrect) btnColor = AppTheme.dangerLight;
            }

            return Container(
              margin: const EdgeInsets.only(bottom: 6),
              child: OutlinedButton(
                style: OutlinedButton.styleFrom(
                  backgroundColor: btnColor,
                  alignment: Alignment.centerLeft,
                  side: BorderSide(
                    color: q.selectedIndex != null && isCorrect ? AppTheme.success : AppTheme.cardBorder,
                  ),
                ),
                onPressed: q.selectedIndex == null
                    ? () {
                        setState(() {
                          q.selectedIndex = idx;
                        });
                      }
                    : null,
                child: Text(option, style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary)),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildSessionDrawer(ChatProvider chat) {
    return Drawer(
      backgroundColor: AppTheme.card,
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Chat History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  IconButton(
                    icon: const Icon(Icons.add_comment_outlined, color: AppTheme.primary),
                    onPressed: () {
                      if (_selectedModule != null) {
                        chat.createSession(_selectedModule!.id);
                        Navigator.pop(context);
                      }
                    },
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: AppTheme.cardBorder),
            Expanded(
              child: chat.sessions.isEmpty
                  ? const Center(child: Text('No previous chats', style: TextStyle(color: AppTheme.textSecondary)))
                  : ListView.builder(
                      itemCount: chat.sessions.length,
                      itemBuilder: (context, idx) {
                        final s = chat.sessions[idx];
                        final isActive = chat.activeSession?.id == s.id;

                        return ListTile(
                          selected: isActive,
                          selectedTileColor: AppTheme.primaryLight,
                          leading: Icon(Icons.chat_bubble_outline, size: 18, color: isActive ? AppTheme.primary : AppTheme.textSecondary),
                          title: Text(s.title, style: TextStyle(fontWeight: isActive ? FontWeight.w800 : FontWeight.w600, fontSize: 13)),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, size: 16, color: AppTheme.danger),
                            onPressed: () {
                              if (_selectedModule != null) {
                                chat.deleteSession(_selectedModule!.id, s.id);
                              }
                            },
                          ),
                          onTap: () {
                            if (_selectedModule != null) {
                              chat.selectSession(_selectedModule!.id, s);
                              Navigator.pop(context);
                            }
                          },
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
