import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  Divider,
  Fade,
  Zoom,
  Alert,
  Button,
} from '@mui/material';
import {
  Diamond as DiamondIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Security as SecurityIcon,
  LocalShipping as ShippingIcon,
  Support as SupportIcon,
} from '@mui/icons-material';

const About = () => {


  // Handle team member click - removed intentional error throwing
  const handleTeamMemberClick = () => {
    // Team member click functionality can be implemented here
  };

  const values = [
    {
      icon: <DiamondIcon sx={{ fontSize: 40 }} />,
      title: "Excellence",
      description: "We curate only the finest products, ensuring every item meets our high standards of quality and craftsmanship."
    },
    {
      icon: <StarIcon sx={{ fontSize: 40 }} />,
      title: "Innovation",
      description: "Constantly evolving and embracing new trends while maintaining timeless elegance and sophistication."
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
      title: "Passion",
      description: "Our love for luxury drives everything we do, from product selection to customer experience."
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Trust",
      description: "Building lasting relationships through transparency, reliability, and exceptional service."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      bio: "Visionary leader with 15+ years in luxury retail"
    },
    {
      name: "Michael Chen",
      role: "Creative Director",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Award-winning designer with global fashion experience"
    },
    {
      name: "Emma Rodriguez",
      role: "Head of Operations",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      bio: "Expert in luxury supply chain and customer experience"
    },
    {
      name: "David Kim",
      role: "Technology Lead",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Innovator in e-commerce and digital luxury experiences"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "1000+", label: "Premium Products" },
    { number: "15+", label: "Years Experience" },
    { number: "24/7", label: "Customer Support" }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#fafafa' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
        color: 'white',
        py: 8,
        mb: 6,
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Our Story
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 400,
                opacity: 0.9,
                lineHeight: 1.6,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Crafting luxury experiences for the discerning shopper since 2008
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Story Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Box sx={{ maxWidth: 800, mx: 'auto', mb: 6 }}>
            <Fade in={true} style={{ transitionDelay: '200ms' }}>
              <Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 3,
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #d4af37 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  A Legacy of Luxury
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
                  Founded in 2008, LUXE began as a small boutique with a big vision: to bring the world's finest luxury products to discerning customers who appreciate quality, craftsmanship, and timeless elegance.
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}>
                  What started as a passion project has grown into a global destination for luxury shopping, serving over 50,000 satisfied customers worldwide. Our commitment to excellence remains unchanged - we still personally curate every product, ensuring it meets our exacting standards.
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                  Today, LUXE continues to redefine luxury e-commerce, combining cutting-edge technology with the personal touch that makes every shopping experience truly exceptional.
                </Typography>
              </Box>
            </Fade>
          </Box>
          
          <Zoom in={true} style={{ transitionDelay: '400ms' }}>
            <Box sx={{ 
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.1)',
              maxWidth: 600,
              mx: 'auto',
            }}>
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
                alt="Luxury Store"
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Zoom>
        </Box>

        {/* Stats Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              background: 'linear-gradient(135deg, #1a1a1a 0%, #404040 100%)',
              color: 'white',
              borderRadius: 4,
              maxWidth: 1000,
              mx: 'auto',
            }}
          >
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <Grid container spacing={4} justifyContent="center">
                {stats.map((stat, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box sx={{ 
                      textAlign: 'center',
                      px: 2,
                      py: 1,
                    }}>
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 800,
                          mb: 1,
                          background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          opacity: 0.9,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          fontWeight: 500,
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Box>

        {/* Values Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              mb: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #d4af37 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Our Values
          </Typography>
          
          <Grid container spacing={4} justifyContent="center">
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Zoom in={true} style={{ transitionDelay: `${index * 200}ms` }}>
                  <Card sx={{ 
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15)',
                    },
                  }}>
                    <CardContent>
                      <Box sx={{ 
                        mb: 3,
                        color: '#d4af37',
                        display: 'flex',
                        justifyContent: 'center',
                      }}>
                        {value.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          mb: 2,
                          color: 'text.primary',
                        }}
                      >
                        {value.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ lineHeight: 1.6 }}
                      >
                        {value.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6, opacity: 0.3 }} />

        {/* Team Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              mb: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #d4af37 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Meet Our Team
          </Typography>
          
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Grid container spacing={4} justifyContent="center">
              {team.map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Zoom in={true} style={{ transitionDelay: `${index * 200}ms` }}>
                    <Card 
                      onClick={() => handleTeamMemberClick(member)}
                      sx={{ 
                        height: '100%',
                        textAlign: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15)',
                        },
                      }}>
                      <CardContent sx={{ p: 3 }}>
                        <Avatar
                          src={member.image}
                          sx={{ 
                            width: 120, 
                            height: 120, 
                            mx: 'auto', 
                            mb: 3,
                            border: '4px solid #f0f0f0',
                          }}
                        />
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700,
                            mb: 1,
                            color: 'text.primary',
                          }}
                        >
                          {member.name}
                        </Typography>
                        <Chip
                          label={member.role}
                          size="small"
                          sx={{
                            mb: 2,
                            background: 'linear-gradient(135deg, #d4af37 0%, #e6c866 100%)',
                            color: '#1a1a1a',
                            fontWeight: 600,
                          }}
                        />
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ lineHeight: 1.6 }}
                        >
                          {member.bio}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Commitment Section */}
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 6,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: 4,
              textAlign: 'center',
              maxWidth: 1000,
              mx: 'auto',
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                mb: 3,
                background: 'linear-gradient(135deg, #1a1a1a 0%, #d4af37 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Our Commitment to You
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                lineHeight: 1.8,
                fontSize: '1.1rem',
                maxWidth: 800,
                mx: 'auto',
              }}
            >
              We're committed to providing you with an unparalleled luxury shopping experience. From our carefully curated product selection to our exceptional customer service, every detail is designed to exceed your expectations.
            </Typography>
            
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ShippingIcon sx={{ fontSize: 48, color: '#d4af37', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Free Shipping
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complimentary worldwide shipping on all orders
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <SecurityIcon sx={{ fontSize: 48, color: '#d4af37', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      Secure Shopping
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bank-level security for your peace of mind
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <SupportIcon sx={{ fontSize: 48, color: '#d4af37', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      24/7 Support
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Round-the-clock customer service and support
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Container>


    </Box>
  );
};

export default About;
