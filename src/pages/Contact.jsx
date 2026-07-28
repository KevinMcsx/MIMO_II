import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MessageCircle, Github } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast({
        title: 'Message sent! 🎉',
        description: `Thanks, ${form.name}! We'll get back to you soon.`,
      });
      setForm({ name: '', email: '', message: '' });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg mb-4">
            <Mail className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-800 mb-3">Contact Us</h1>
          <p className="text-slate-600 text-lg">Questions, feedback, or just want to say hi?</p>
        </motion.div>

        {/* Contact methods */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid sm:grid-cols-2 gap-4 mb-6"
        >
          <a
            href="mailto:hello@loopybrain.app"
            className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-200 shadow-lg hover:scale-105 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Email Us</p>
              <p className="text-xs text-slate-500">hello@loopybrain.app</p>
            </div>
          </a>

          <a
            href="https://github.com/loopybrain"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-200 shadow-lg hover:scale-105 transition-transform"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">GitHub</p>
              <p className="text-xs text-slate-500">github.com/loopybrain</p>
            </div>
          </a>
        </motion.div>

        {/* Contact form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border-2 border-purple-200 shadow-xl space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-bold text-slate-800">Send a Message</h2>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us what's on your mind..."
              rows={5}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={sending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Sending...' : 'Send Message'}
          </Button>
        </motion.form>

        <div className="text-center mt-6">
          <Link to="/">
            <Button variant="outline">Back to Game</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}