     1  import React, { useEffect, useState, useMemo } from 'react';
     2  import { motion, AnimatePresence } from 'framer-motion';
     3  import {
     4      Search, Filter, Star, Clock, Award, CheckCircle2,
     5      Zap, TrendingUp, Target, User, ChevronRight,
     6      ArrowUpDown, Info, Sparkles, MessageSquare, ArrowLeft
     7  } from 'lucide-react';
     8  import { toast } from 'react-hot-toast';
     9  import api from '../../services/api';
    10  import '../../styles/macos-member.css';
    11  import './MyTrainer.css';
    12  
    13  interface Skill {
    14      name: string;
    15      category: string;
    16      level: string;
    17      isPrimary: boolean;
    18  }
    19  
    20  interface TrainerProfile {
    21      userId: number;
    22      name: string;
    23      email: string;
    24      phone: string;
    25      bio: string;
    26      specializations: string[];
    27      skills: Skill[];
    28      experienceYears: number;
    29      stats: {
    30          rating: number;
    31          reviews: number;
    32          experience: string;
    33          activeMembers: number;
    34      };
    35      isBestMatch?: boolean;
    36      matchPercentage?: number;
    37  }
    38  
    39  const SKILL_CATEGORIES = [
    40      'All Skills',
    41      'Weight Loss',
    42      'Muscle Gain',
    43      'Strength Training',
    44      'Cardio & Endurance',
    45      'Rehabilitation',
    46      'Yoga / Mobility'
    47  ];
    48  
    49  const containerVariants = {
    50      hidden: { opacity: 0 },
    51      visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    52  };
    53  
    54  const cardVariants = {
    55      hidden: { opacity: 0, y: 20 },
    56      visible: { opacity: 1, y: 0 },
    57      hover: { y: -5, transition: { duration: 0.2 } }
    58  };
    59  
    60  const MyTrainer: React.FC = () => {
    61      const [trainers, setTrainers] = useState<TrainerProfile[]>([]);
    62      const [assignedTrainers, setAssignedTrainers] = useState<TrainerProfile[]>([]);
    63      const [loading, setLoading] = useState(true);
    64      const [searchQuery, setSearchQuery] = useState('');
    65      const [selectedCategory, setSelectedCategory] = useState('All Skills');
    66      const [sortBy, setSortBy] = useState<'rating' | 'match' | 'experience'>('match');
    67      const [requesting, setRequesting] = useState<number | null>(null);
    68      const [showDiscovery, setShowDiscovery] = useState(false);
    69  
    70      useEffect(() => {
    71          const fetchData = async () => {
    72              try {
    73                  // Fetch assigned trainers
    74                  const assignedResponse = await api.get('/api/member/trainers/assigned');
    75                  setAssignedTrainers(assignedResponse.data || []);
    76  
    77                  // Fetch all trainers for discovery
    78                  const allResponse = await api.get('/api/member/trainers');
    79                  let data = allResponse.data;
    80  
    81                  // If data is empty, use enhanced mock data for demonstration
    82                  if (!data || data.length === 0) {
    83                      data = getMockTrainers();
    84                  }
    85  
    86                  setTrainers(data);
    87              } catch (error) {
    88                  console.error('Failed to fetch trainers:', error);
    89                  setTrainers(getMockTrainers());
    90              } finally {
    91                  setLoading(false);
    92              }
    93          };
    94  
    95          fetchData();
    96      }, []);
    97  
    98      const handleRequestTrainer = async (trainerId: number, trainerName: string) => {
    99          setRequesting(trainerId);
   100          try {
   101              const response = await api.post(`/api/member/trainers/${trainerId}/request`);
   102              toast.success(response.data.message || `Trainer ${trainerName} has been assigned to you.`);
   103              
   104              // Refresh assigned trainers
   105              const assignedResponse = await api.get('/api/member/trainers/assigned');
   106              setAssignedTrainers(assignedResponse.data || []);
   107              setShowDiscovery(false);
   108          } catch (error: any) {
   109              toast.error(error.response?.data?.message || 'Failed to request trainer');
   110          } finally {
   111              setRequesting(null);
   112          }
   113      };
   114  
   115      const getMockTrainers = (): TrainerProfile[] => [
   116          {
   117              userId: 1,
   118              name: 'Alex Rivera',
   119              email: 'alex@fitness.com',
   120              phone: '+1 555-0101',
   121              bio: 'Specialist in high-intensity hypertrophy and strength training with 10+ years of experience.',
   122              specializations: ['Hypertrophy', 'Strength'],
   123              experienceYears: 10,
   124              skills: [
   125                  { name: 'Muscle Gain', category: 'Muscle Gain', level: 'Expert', isPrimary: true },
   126                  { name: 'Strength Training', category: 'Strength Training', level: 'Expert', isPrimary: true },
   127                  { name: 'Powerlifting', category: 'Strength Training', level: 'Expert', isPrimary: false },
   128                  { name: 'Nutrition', category: 'Weight Loss', level: 'Intermediate', isPrimary: false }
   129              ],
   130              stats: { rating: 4.9, reviews: 128, experience: '10 Yrs', activeMembers: 15 },
   131              isBestMatch: true,
   132              matchPercentage: 98
   133          },
   134          {
   135              userId: 2,
   136              name: 'Sarah Chen',
   137              email: 'sarah@fitness.com',
   138              phone: '+1 555-0102',
   139              bio: 'Expert yoga instructor focusing on mobility, flexibility, and post-injury rehabilitation.',
   140              specializations: ['Yoga', 'Rehab'],
   141              experienceYears: 7,
   142              skills: [
   143                  { name: 'Yoga / Mobility', category: 'Yoga / Mobility', level: 'Expert', isPrimary: true },
   144                  { name: 'Rehabilitation', category: 'Rehabilitation', level: 'Expert', isPrimary: true },
   145                  { name: 'Pilates', category: 'Yoga / Mobility', level: 'Expert', isPrimary: false },
   146                  { name: 'Mindfulness', category: 'Yoga / Mobility', level: 'Intermediate', isPrimary: false }
   147              ],
   148              stats: { rating: 4.8, reviews: 95, experience: '7 Yrs', activeMembers: 12 },
   149              matchPercentage: 85
   150          },
   151          {
   152              userId: 3,
   153              name: 'Marcus Thorne',
   154              email: 'marcus@fitness.com',
   155              phone: '+1 555-0103',
   156              bio: 'Dedicated weight loss coach helping clients achieve sustainable results through cardio and endurance.',
   157              specializations: ['Weight Loss', 'Endurance'],
   158              experienceYears: 5,
   159              skills: [
   160                  { name: 'Weight Loss', category: 'Weight Loss', level: 'Expert', isPrimary: true },
   161                  { name: 'Cardio & Endurance', category: 'Cardio & Endurance', level: 'Expert', isPrimary: true },
   162                  { name: 'HIIT', category: 'Cardio & Endurance', level: 'Expert', isPrimary: false },
   163                  { name: 'Kettlebells', category: 'Strength Training', level: 'Intermediate', isPrimary: false }
   164              ],
   165              stats: { rating: 4.7, reviews: 82, experience: '5 Yrs', activeMembers: 18 },
   166              matchPercentage: 92
   167          }
   168      ];
   169  
   170      const filteredAndSortedTrainers = useMemo(() => {
   171          let result = trainers.filter(t => {
   172              const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
   173                  t.skills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
   174              
   175              const matchesCategory = selectedCategory === 'All Skills' ||
   176                  t.skills.some(s => s.category === selectedCategory);
   177              
   178              return matchesSearch && matchesCategory;
   179          });
   180  
   181          result.sort((a, b) => {
   182              if (sortBy === 'rating') return b.stats.rating - a.stats.rating;
   183              if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
   184              return (b.matchPercentage || 0) - (a.matchPercentage || 0);
   185          });
   186  
   187          return result;
   188      }, [trainers, searchQuery, selectedCategory, sortBy]);
   189  
   190      if (loading) {
   191          return (
   192              <div className="macos-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
   193                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
   194                      <Zap size={32} color="var(--macos-accent)" />
   195                  </motion.div>
   196              </div>
   197          );
   198      }
   199  
   200      return (
   201          <motion.div
   202              className="macos-page trainer-macos"
   203              variants={containerVariants}
   204              initial="hidden"
   205              animate="visible"
   206          >
   207              <AnimatePresence mode="wait">
   208                  {!showDiscovery ? (
   209                      <motion.div
   210                          key="assigned-view"
   211                          initial={{ opacity: 0, x: -20 }}
   212                          animate={{ opacity: 1, x: 0 }}
   213                          exit={{ opacity: 0, x: -20 }}
   214                      >
   215                          <header className="trainer__header">
   216                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
   217                                  <div>
   218                                      <h1 className="macos-heading-xl">Your Training Program</h1>
   219                                      <p className="macos-text-md">Personalized guidance to reach your goals</p>
   220                                  </div>
   221                                  <button 
   222                                      className="macos-btn macos-btn--primary" 
   223                                      onClick={() => setShowDiscovery(true)}
   224                                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
   225                                  >
   226                                      <Search size={16} />
   227                                      Find Trainer
   228                                  </button>
   229                              </div>
   230                          </header>
   231  
   232                          {/* Assigned Trainer Section */}
   233                          <section style={{ marginBottom: 'var(--space-10)' }}>
   234                              <h2 className="macos-heading-md" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
   235                                  <CheckCircle2 size={20} color="var(--macos-success)" />
   236                                  Your Assigned Trainer
   237                              </h2>
   238                              
   239                              {assignedTrainers.length > 0 ? (
   240                                  <div className="trainer-grid">
   241                                      {assignedTrainers.map(trainer => (
   242                                          <motion.div
   243                                              key={`assigned-${trainer.userId}`}
   244                                              variants={cardVariants}
   245                                              initial="hidden"
   246                                              animate="visible"
   247                                              className="glass-card trainer-card trainer-card--assigned"
   248                                          >
   249                                              <div className="trainer-card__header">
   250                                                  <div className="trainer-card__avatar">
   251                                                      {trainer.name.split(' ').map(n => n[0]).join('')}
   252                                                  </div>
   253                                                  <div className="trainer-card__info">
   254                                                      <h3>{trainer.name}</h3>
   255                                                      <div className="trainer-card__rating">
   256                                                          <Star size={14} fill="var(--macos-warning)" color="var(--macos-warning)" />
   257                                                          <span>{trainer.stats.rating}</span>
   258                                                      </div>
   259                                                  </div>
   260                                                  <div className="macos-badge macos-badge--green" style={{ marginLeft: 'auto' }}>
   261                                                      Current Trainer
   262                                                  </div>
   263                                              </div>
   264                                              <div className="trainer-card__skills">
   265                                                  <div className="skill-tags">
   266                                                      {trainer.skills.slice(0, 3).map((skill, idx) => (
   267                                                          <div key={idx} className="skill-badge skill-badge--primary">
   268                                                              {skill.name}
   269                                                          </div>
   270                                                      ))}
   271                                                  </div>
   272                                              </div>
   273                                              <button className="macos-btn macos-btn--primary" style={{ marginTop: 'var(--space-4)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
   274                                                  <MessageSquare size={16} />
   275                                                  Message {trainer.name.split(' ')[0]}
   276                                              </button>
   277                                          </motion.div>
   278                                      ))}
   279                                  </div>
   280                              ) : (
   281                                  <div className="glass-card" style={{ padding: 'var(--space-10)', textAlign: 'center', border: '1px dashed var(--macos-border)', background: 'rgba(255,255,255,0.02)' }}>
   282                                      <div className="macos-empty-state">
   283                                          <div className="macos-empty-state__icon" style={{ marginBottom: 'var(--space-4)', background: 'var(--macos-bg-tertiary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
   284                                              <User size={32} style={{ opacity: 0.5 }} />
   285                                          </div>
   286                                          <h3 className="macos-heading-md" style={{ marginBottom: 'var(--space-2)' }}>No trainer is assigned to you</h3>
   287                                          <p className="macos-text-md" style={{ maxWidth: '500px', margin: '0 auto var(--space-6)', color: 'var(--macos-text-secondary)' }}>
   288                                              Request trainer assignments at the front desk or browse our professional trainers to find your perfect match.
   289                                          </p>
   290                                          <button 
   291                                              className="macos-btn macos-btn--primary" 
   292                                              onClick={() => setShowDiscovery(true)}
   293                                              style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
   294                                          >
   295                                              <Sparkles size={16} />
   296                                              Find Your Trainer
   297                                          </button>
   298                                      </div>
   299                                  </div>
   300                              )}
   301                          </section>
   302                      </motion.div>
   303                  ) : (
   304                      <motion.div
   305                          key="discovery-view"
   306                          initial={{ opacity: 0, x: 20 }}
   307                          animate={{ opacity: 1, x: 0 }}
   308                          exit={{ opacity: 0, x: 20 }}
   309                      >
   310                          <header className="trainer__header" style={{ marginBottom: 'var(--space-6)' }}>
   311                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
   312                                  <div>
   313                                      <button 
   314                                          className="macos-btn macos-btn--secondary" 
   315                                          onClick={() => setShowDiscovery(false)}
   316                                          style={{ marginBottom: 'var(--space-4)', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
   317                                      >
   318                                          <ArrowLeft size={14} /> Back to Program
   319                                      </button>
   320                                      <h2 className="macos-heading-xl">Find Your Trainer</h2>
   321                                      <p className="macos-text-md">Explore all professional trainers in our system</p>
   322                                  </div>
   323                                  <div className="macos-badge macos-badge--blue" style={{ marginTop: 'var(--space-12)' }}>
   324                                      <Target size={14} /> Personalized Matching Active
   325                                  </div>
   326                              </div>
   327                          </header>
   328  
   329                          {/* Category Filters */}
   330                          <div className="glass-card trainer-discovery__filters macos-hide-scrollbar" style={{ overflowX: 'auto', marginBottom: 'var(--space-4)' }}>
   331                              {SKILL_CATEGORIES.map(cat => (
   332                                  <button
   333                                      key={cat}
   334                                      className={`trainer-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
   335                                      onClick={() => setSelectedCategory(cat)}
   336                                  >
   337                                      {cat}
   338                                  </button>
   339                              ))}
   340                          </div>
   341  
   342                          {/* Controls */}
   343                          <div className="trainer-discovery__controls">
   344                              <div className="trainer-search-wrapper">
   345                                  <Search size={18} />
   346                                  <input
   347                                      type="text"
   348                                      placeholder="Search by name or specific skill..."
   349                                      value={searchQuery}
   350                                      onChange={(e) => setSearchQuery(e.target.value)}
   351                                  />
   352                              </div>
   353                              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
   354                                  <div className="macos-select-wrapper" style={{ minWidth: '160px' }}>
   355                                      <ArrowUpDown size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.6 }} />
   356                                      <select
   357                                          value={sortBy}
   358                                          onChange={(e) => setSortBy(e.target.value as any)}
   359                                          className="macos-btn macos-btn--secondary"
   360                                          style={{ paddingLeft: '34px', width: '100%', textAlign: 'left' }}
   361                                      >
   362                                          <option value="match">Sort by Match</option>
   363                                          <option value="rating">Top Rated</option>
   364                                          <option value="experience">Experience</option>
   365                                      </select>
   366                                  </div>
   367                              </div>
   368                          </div>
   369  
   370                          {/* Results Info */}
   371                          <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
   372                              <span className="macos-text-sm macos-text-tertiary">
   373                                  Showing {filteredAndSortedTrainers.length} professional trainers
   374                              </span>
   375                          </div>
   376  
   377                          {/* Trainer Grid */}
   378                          <div className="trainer-grid">
   379                              <AnimatePresence mode="popLayout">
   380                                  {filteredAndSortedTrainers.map((trainer) => (
   381                                      <motion.div
   382                                          key={trainer.userId}
   383                                          layout
   384                                          variants={cardVariants}
   385                                          initial="hidden"
   386                                          animate="visible"
   387                                          exit={{ opacity: 0, scale: 0.9 }}
   388                                          whileHover="hover"
   389                                          className={`glass-card trainer-card ${trainer.isBestMatch ? 'trainer-card--best-match' : ''}`}
   390                                      >
   391                                          {trainer.isBestMatch && (
   392                                              <div className="best-match-badge">
   393                                                  <Zap size={12} fill="currentColor" /> Best Match
   394                                              </div>
   395                                          )}
   396  
   397                                          <div className="trainer-card__header">
   398                                              <div className="trainer-card__avatar">
   399                                                  {trainer.name.split(' ').map(n => n[0]).join('')}
   400                                              </div>
   401                                              <div className="trainer-card__info">
   402                                                  <h3>{trainer.name}</h3>
   403                                                  <div className="trainer-card__rating">
   404                                                      <Star size={14} fill="var(--macos-warning)" color="var(--macos-warning)" />
   405                                                      <span>{trainer.stats.rating}</span>
   406                                                      <span className="macos-text-tertiary">({trainer.stats.reviews})</span>
   407                                                  </div>
   408                                                  {trainer.matchPercentage && (
   409                                                      <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--macos-accent)', fontWeight: 600 }}>
   410                                                          {trainer.matchPercentage}% Match
   411                                                      </div>
   412                                                  )}
   413                                              </div>
   414                                          </div>
   415  
   416                                          <p className="macos-text-sm" style={{ marginBottom: 'var(--space-4)', color: 'var(--macos-text-secondary)', height: '40px', overflow: 'hidden' }}>
   417                                              {trainer.bio}
   418                                          </p>
   419  
   420                                          <div className="trainer-card__skills">
   421                                              <div className="skill-tags">
   422                                                  {trainer.skills.map((skill, idx) => (
   423                                                      <div
   424                                                          key={idx}
   425                                                          className={`skill-badge ${skill.isPrimary ? 'skill-badge--primary' : 'skill-badge--secondary'}`}
   426                                                      >
   427                                                          {skill.name}
   428                                                      </div>
   429                                                  ))}
   430                                              </div>
   431                                          </div>
   432  
   433                                          <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: '8px' }}>
   434                                              <button
   435                                                  className={`macos-btn ${assignedTrainers.some(at => at.userId === trainer.userId) ? 'macos-btn--secondary' : 'macos-btn--primary'}`}
   436                                                  style={{ flex: 1 }}
   437                                                  onClick={() => handleRequestTrainer(trainer.userId, trainer.name)}
   438                                                  disabled={requesting === trainer.userId || assignedTrainers.some(at => at.userId === trainer.userId)}
   439                                              >
   440                                                  {requesting === trainer.userId ? 'Assigning...' : 
   441                                                   assignedTrainers.some(at => at.userId === trainer.userId) ? 'Assigned' : 'Request Assignment'}
   442                                              </button>
   443                                              <button className="macos-btn macos-btn--secondary" style={{ padding: '8px' }}>
   444                                                  <Info size={18} />
   445                                              </button>
   446                                          </div>
   447                                      </motion.div>
   448                                  ))}
   449                              </AnimatePresence>
   450                          </div>
   451  
   452                          {filteredAndSortedTrainers.length === 0 && (
   453                              <div className="glass-card" style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
   454                                  <div className="macos-empty-state">
   455                                      <div className="macos-empty-state__icon"><Filter size={32} /></div>
   456                                      <h3 className="macos-heading-md">No trainers match your criteria</h3>
   457                                      <p className="macos-text-md">Try adjusting your filters or search terms.</p>
   458                                  </div>
   459                              </div>
   460                          )}
   461                      </motion.div>
   462                  )}
   463              </AnimatePresence>
   464          </motion.div>
   465      );
   466  };
   467  
   468  export default MyTrainer;
   469  