import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: 'zoltan.i.fekete@windowslive.com',
        subject: 'LoopyBrain - Question',
        body: `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
        from_name: form.name,
      });
      toast({
        title: 'Message sent! 🎉',
        description: `Thanks, ${form.name}! We'll get back to you soon.`,
      });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast({
        title: 'Message failed to send',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
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