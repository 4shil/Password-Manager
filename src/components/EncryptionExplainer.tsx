'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Key, Lock, Shield, Sparkles, ArrowDown } from 'lucide-react';

interface StepProps {
    number: number;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    animation: React.ReactNode;
    delay?: number;
}

function EncryptionStep({ number, title, description, icon, color, animation, delay = 0 }: StepProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [isInView, controls]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
                hidden: { opacity: 0, x: number % 2 === 0 ? 50 : -50 },
                visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.6, delay }
                }
            }}
            className="relative"
        >
            <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Content */}
                <div className={`${number % 2 === 0 ? 'md:order-2' : ''}`}>
                    <motion.div
                        variants={{
                            hidden: { scale: 0.8, opacity: 0 },
                            visible: {
                                scale: 1,
                                opacity: 1,
                                transition: { delay: delay + 0.2, type: 'spring', stiffness: 200 }
                            }
                        }}
                        className="inline-flex items-center gap-3 mb-4"
                    >
                        <div
                            className="w-12 h-12 flex items-center justify-center border-[3px] border-[var(--border)] shadow-[3px_3px_0_var(--shadow-color)]"
                            style={{ backgroundColor: color }}
                        >
                            <span className="font-bold text-lg">{number}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--text)]">{title}</h3>
                    </motion.div>

                    <p className="text-[var(--text-muted)] text-lg leading-relaxed mb-6">
                        {description}
                    </p>

                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 border-[2px] border-[var(--border)]"
                        style={{ backgroundColor: color }}
                    >
                        {icon}
                        <span className="font-bold text-sm">Secure</span>
                    </div>
                </div>

                {/* Animation */}
                <div className={`${number % 2 === 0 ? 'md:order-1' : ''}`}>
                    <motion.div
                        variants={{
                            hidden: { scale: 0.9, opacity: 0 },
                            visible: {
                                scale: 1,
                                opacity: 1,
                                transition: { delay: delay + 0.3, duration: 0.5 }
                            }
                        }}
                        className="p-8 bg-[var(--surface)] border-[3px] border-[var(--border)] shadow-[6px_6px_0_var(--shadow-color)]"
                    >
                        {animation}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

// Animated password input
function PasswordAnimation() {
    const [dots, setDots] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev + 1) % 13);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4">
            <div className="text-sm font-bold text-[var(--text)]">Master Password</div>
            <div className="p-4 bg-[var(--muted)] border-[3px] border-[var(--border)] font-mono text-2xl tracking-widest">
                {'•'.repeat(dots)}
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-0.5 h-6 bg-[var(--text)] ml-1 align-middle"
                />
            </div>
            <p className="text-sm text-[var(--text-muted)]">Your password never leaves your device</p>
        </div>
    );
}

// Key derivation animation
function KeyDerivationAnimation() {
    const [progress, setProgress] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 30);
            return () => clearInterval(interval);
        }
    }, [isInView]);

    return (
        <div ref={ref} className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--text)]">Argon2id</span>
                <span className="font-mono text-[var(--pink)] font-bold">
                    {progress}% complete
                </span>
            </div>
            <div className="h-4 bg-[var(--muted)] border-[2px] border-[var(--border)] overflow-hidden">
                <motion.div
                    className="h-full bg-[var(--pink)]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>
            <div className="grid grid-cols-3 gap-2">
                {['Password', '+', 'Salt', '→', 'Strong Key'].map((item, i) => (
                    <motion.div
                        key={i}
                        className={`text-center p-2 text-sm font-bold ${i === 4 ? 'bg-[var(--mint)] border-[2px] border-[var(--border)]' : ''
                            }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: progress > (i * 20) ? 1 : 0.3 }}
                    >
                        {item}
                    </motion.div>
                ))}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
                64MB memory • 4 threads • Maximum security
            </p>
        </div>
    );
}

// Vault unlocking animation
function VaultUnlockAnimation() {
    const [unlocked, setUnlocked] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            setTimeout(() => setUnlocked(true), 1000);
        }
    }, [isInView]);

    return (
        <div ref={ref} className="flex items-center justify-center py-8">
            <motion.div
                className="relative"
                animate={unlocked ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    className="w-32 h-32 flex items-center justify-center border-[4px] border-[var(--border)] shadow-[6px_6px_0_var(--shadow-color)]"
                    style={{ backgroundColor: unlocked ? 'var(--mint)' : 'var(--muted)' }}
                >
                    <motion.div
                        animate={unlocked ? { rotate: [0, -20, 0] } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        {unlocked ? (
                            <Shield className="w-12 h-12 text-[#1a1a1a]" />
                        ) : (
                            <Lock className="w-12 h-12 text-[var(--text-muted)]" />
                        )}
                    </motion.div>
                </motion.div>

                {unlocked && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-[var(--yellow)] border-[2px] border-[var(--border)] flex items-center justify-center"
                    >
                        <Sparkles className="w-4 h-4" />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

// Data decryption animation
function DecryptionAnimation() {
    const [decrypted, setDecrypted] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            setTimeout(() => setDecrypted(true), 1500);
        }
    }, [isInView]);

    const scrambledText = 'x#k9@mP2$nL';
    const clearText = 'MyPassword';

    return (
        <div ref={ref} className="space-y-4">
            <div className="text-sm font-bold text-[var(--text)]">Your saved password</div>
            <motion.div
                className="p-4 border-[3px] border-[var(--border)] font-mono text-xl"
                style={{ backgroundColor: decrypted ? 'var(--mint)' : 'var(--muted)' }}
            >
                {decrypted ? (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[#1a1a1a]"
                    >
                        {clearText}
                    </motion.span>
                ) : (
                    <span className="text-[var(--text-muted)]">
                        {scrambledText.split('').map((char, i) => (
                            <motion.span
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </span>
                )}
            </motion.div>
            <p className="text-sm text-[var(--text-muted)]">
                {decrypted ? '✓ Decrypted successfully' : 'Decrypting...'}
            </p>
        </div>
    );
}

export function EncryptionExplainer() {
    const headerRef = useRef(null);
    const headerInView = useInView(headerRef, { once: true, margin: '-50px' });

    const steps: Omit<StepProps, 'delay'>[] = [
        {
            number: 1,
            title: 'You type your password',
            description: 'Your master password is the only thing you need to remember. It never gets sent to our servers.',
            icon: <Key className="w-4 h-4" />,
            color: 'var(--yellow)',
            animation: <PasswordAnimation />,
        },
        {
            number: 2,
            title: 'We create a strong key',
            description: 'Using Argon2id, we derive an unbreakable encryption key from your password using 64MB of memory.',
            icon: <Lock className="w-4 h-4" />,
            color: 'var(--pink)',
            animation: <KeyDerivationAnimation />,
        },
        {
            number: 3,
            title: 'Your vault unlocks',
            description: 'The key unlocks your encrypted vault. Without the right password, the data stays locked forever.',
            icon: <Shield className="w-4 h-4" />,
            color: 'var(--mint)',
            animation: <VaultUnlockAnimation />,
        },
        {
            number: 4,
            title: 'Data is decrypted',
            description: 'Your passwords transform from scrambled nonsense into readable text — only in your browser.',
            icon: <Sparkles className="w-4 h-4" />,
            color: 'var(--sky)',
            animation: <DecryptionAnimation />,
        },
    ];

    return (
        <section id="security" className="py-24 px-6 bg-[var(--background)] border-t-[3px] border-[var(--border)]">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    ref={headerRef}
                    initial={{ opacity: 0, y: 30 }}
                    animate={headerInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-[var(--lavender)] border-[3px] border-[var(--border)] shadow-[3px_3px_0_var(--shadow-color)]">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-bold">How Encryption Works</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-[var(--text)] mb-6">
                        Your passwords are<br />
                        <span className="text-[var(--pink)]">truly private</span>
                    </h2>

                    <p className="text-[var(--text-muted)] max-w-xl mx-auto text-lg">
                        Follow along to see how we keep your data safe. Scroll down to learn more.
                    </p>

                    <motion.div
                        className="mt-8"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <ArrowDown className="w-6 h-6 text-[var(--text-muted)] mx-auto" />
                    </motion.div>
                </motion.div>

                {/* Steps */}
                <div className="space-y-32">
                    {steps.map((step, index) => (
                        <EncryptionStep key={step.number} {...step} delay={index * 0.1} />
                    ))}
                </div>

                {/* Conclusion */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="mt-32 p-8 bg-[var(--mint)] border-[3px] border-[var(--border)] shadow-[8px_8px_0_var(--shadow-color)] text-center"
                >
                    <Shield className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">That's it!</h3>
                    <p className="text-lg max-w-lg mx-auto">
                        Your data is encrypted and decrypted entirely in your browser.
                        We never see your passwords, and neither can anyone else.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
