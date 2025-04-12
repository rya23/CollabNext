'use client';
import Drawer from './Drawer';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { CardHoverEffectDemo } from './CardEffect';
// import CameraOCR from './CameraOCR';

// Feature card component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
    return (
        <motion.div
            className="bg-card border border-border rounded-xl p-6 flex flex-col items-center"
            whileHover={{
                y: -5,
                boxShadow: '0 10px 30px -15px rgba(138, 75, 175, 0.2)',
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
        >
            <div className="bg-gradient-to-r from-primary to-primary/80 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
            <p className="text-muted-foreground text-center">{description}</p>
        </motion.div>
    );
};

const AboutUsSection = () => {
    return (
        <div className="min-h-screen mt-[4rem] p-4 sm:p-10 text-foreground flex flex-1 flex-col">
            {/* Header - Adjusted margins */}
            <div className="text-xl text-foreground ml-4 sm:ml-[5rem] mb-8 sm:mb-12">
                <h1 className="text-2xl sm:text-3xl font-bold">About Us</h1>
            </div>

            {/* First text block - Responsive margins and width */}
            <div className="flex flex-col md:flex-row items-center justify-between">
                <motion.div
                    className="w-full md:w-1/2 max-w-[600px] mx-4 sm:ml-[5rem] mb-4"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                    }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2
                        className="text-xl sm:text-2xl font-semibold text-foreground mb-4"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.5 }}
                    >
                        Empowering Creativity, Redefining Possibilities.
                    </motion.h2>
                    <motion.p
                        className="text-muted-foreground text-sm sm:text-base leading-[24px] sm:leading-[30px]"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        We envision a future where creativity flows seamlessly, free from technical barriers. Our AI-driven
                        copilot empowers content creators and filmmakers to bring their ideas to life effortlessly. By integrating
                        cutting-edge technology with intuitive collaboration tools, we strive to enhance storytelling, streamline
                        workflows, and revolutionize the creative process.
                    </motion.p>
                </motion.div>

                {/* Add Document.webm video */}
                <motion.div
                    className="w-full md:w-1/2 max-w-[600px] p-4 flex justify-center"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    {/* <video className="w-full rounded-xl shadow-lg border border-border" autoPlay loop muted playsInline>
                        <source src="/Document.webm" type="video/webm" />
                        Your browser does not support the video tag.
                    </video> */}
                </motion.div>
            </div>

            {/* 3D Model Component */}
            <div className="flex justify-center items-center my-20"></div>

            {/* Mission & Vision section - Adjusted alignment and spacing */}
            <div className="text-xl text-foreground mr-4 sm:mr-[20rem] mb-8 sm:mb-12 self-end">
                <h1 className="text-2xl sm:text-3xl font-bold">Our Mission & Vision</h1>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center justify-between">
                <motion.div
                    className="w-full md:w-1/2 max-w-[600px] mx-4 md:mr-[5rem] mb-16 sm:mb-24 self-center md:self-end"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                    }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2
                        className="text-2xl font-semibold text-foreground mb-4"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.5 }}
                    >
                        AI-Powered Innovation for Limitless Creativity.
                    </motion.h2>
                    <motion.p
                        className="text-muted-foreground text-base leading-[30px]"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        We're dedicated to building tools that break down creative barriers and foster collaboration. Our platform
                        connects visionaries, enabling them to transform ideas into reality through intuitive interfaces and
                        powerful AI assistance. We believe in a future where technology enhances human creativity rather than
                        replacing it, making professional-quality content creation accessible to everyone.
                    </motion.p>
                </motion.div>

                {/* Add Vision.webm video */}
                <motion.div
                    className="w-full md:w-1/2 max-w-[600px] p-4 flex justify-center"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    viewport={{ once: true, amount: 0.3 }}
                >
                    {/* <video className="w-full rounded-xl shadow-lg border border-border" autoPlay loop muted playsInline>
                        <source src="/Vision.webm" type="video/webm" />
                        Your browser does not support the video tag.
                    </video> */}
                </motion.div>
            </div>

            <div className="py-12 sm:py-24 px-4 sm:px-5">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                        Powerful Features
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                        Our platform offers a comprehensive suite of tools designed to streamline your creative workflow
                    </p>
                </motion.div>

                {typeof CardHoverEffectDemo === 'function' ? <CardHoverEffectDemo /> : null}
            </div>

            {/* FAQ Section - Adjusted padding and width */}
            <div className="py-12 sm:py-24 px-4 sm:px-5 bg-card rounded-xl max-w-[95%] sm:max-w-6xl mx-auto w-full mb-8 sm:mb-16">
                <motion.div
                    className="text-center mb-8 sm:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl sm:text-4xl font-bold mb-3 text-foreground">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
                        Find answers to the most common questions about our platform
                    </p>
                </motion.div>

                <motion.div
                    className="max-w-[95%] sm:max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-b border-border">
                            <AccordionTrigger className="text-foreground hover:text-primary text-base sm:text-lg">
                                How does the AI assistant work?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-sm sm:text-base">
                                Our AI assistant analyzes your project needs and creative direction to offer intelligent
                                suggestions, streamline workflows, and help overcome technical obstacles that might slow down your
                                creative process.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="border-b border-border">
                            <AccordionTrigger className="text-foreground hover:text-primary text-base sm:text-lg">
                                Is my data secure on your platform?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-sm sm:text-base">
                                Absolutely. We employ enterprise-grade encryption and security protocols to ensure that all your
                                creative assets and data remain private and protected at all times.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3" className="border-b border-border">
                            <AccordionTrigger className="text-foreground hover:text-primary text-base sm:text-lg">
                                Can I collaborate with my team in real-time?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-sm sm:text-base">
                                Yes, our platform is built for seamless collaboration. Multiple team members can work
                                simultaneously on projects with changes synced in real-time, regardless of location.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4" className="border-b border-border">
                            <AccordionTrigger className="text-foreground hover:text-primary text-base sm:text-lg">
                                What type of creative projects can I use this for?
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-sm sm:text-base">
                                Our platform is versatile and supports a wide range of creative projects including film
                                production, digital content creation, interactive media, and more.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </motion.div>
            </div>

            {/* Get Started Section - Adjusted padding and responsive button */}
            <motion.div
                className="py-12 sm:py-20 px-4 sm:px-5 my-8 sm:my-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl max-w-[95%] sm:max-w-6xl mx-auto text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
            >
                <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6 text-foreground">
                    Ready to Transform Your Creative Process?
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto mb-6 sm:mb-8">
                    Join thousands of creators who are already using our platform to bring their ideas to life.
                </p>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-4 sm:py-6 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all transform hover:scale-105">
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
            </motion.div>
        </div>
    );
};

export default AboutUsSection;
