
/**
 * Subscription plans configuration.
 *
 * Single source of truth for pricing, features, and limits.
 * - `display`: marketing copy shown on the pricing page.
 * - `limits`: machine-readable values for runtime gating.
 *
 * When connecting to Stripe, fill in `stripePriceId` for monthly/yearly.
 */

export type BillingInterval='monthly' | 'yearly';
export type PlanId='free'|'plus'|'premium';

export interface PlanLimits {
    vaultSize:number|null;
    smartRecommendations:boolean;
    advancedInsights:boolean;
    userRating:boolean;
    continueWatching:boolean;
    familyProfiles:boolean;
    priorityRecommendations:boolean;
    earlyAccess:boolean;
}


export interface Plan {
    id:PlanId;
    name:string;
    description:string;
    monthlyPrice:number;
    yearlyPrice:number;
    features:string[];
    cta:string;
    popular?:boolean;
    stripePriceIds:{
        monthly:string|null;
        yearly:string|null;
    };
    limits:PlanLimits;
}



export const PLANS: Plan[] = [
    {
        id:'free',
        name:'Free',
        description:'Start Building Your Personal Vault Today...',
        monthlyPrice:0,
        yearlyPrice:0,
        features:[
            'Up to 20 Saved Titles',
            'Basic Recommendations',
            'Basic Insights',
        ],
        cta:'Get Started',
        stripePriceIds:{
            monthly:null,
            yearly:null,
        },
        limits:{
            vaultSize:20,
            smartRecommendations:false,
            advancedInsights:false,
            userRating:false,
            continueWatching:false,
            familyProfiles:false,
            priorityRecommendations:false,
            earlyAccess:false,
        },
    },
    {
        id: 'plus',
        name: 'Plus',
        description: 'For people who want smarter discovery.',
        monthlyPrice: 7.99,
        yearlyPrice: 79.9,
        features: [
            'Unlimited Vault',
            'Smart recommendations',
            'User ratings',
            'Advanced insights',
            'Continue Watching',
    ],
        cta:'Upgrade To Plus',
        popular:true,
        stripePriceIds:{
            monthly:null,
            yearly:null,
        },
        limits: {
            vaultSize: null,
            smartRecommendations: true,
            advancedInsights: true,
            userRating: true,
            continueWatching: true,
            familyProfiles: false,
            priorityRecommendations: false,
            earlyAccess: false,
        },
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'For households and power users.',
        monthlyPrice: 12.99,
        yearlyPrice: 129.9,
        features: [
            'Everything in Plus',
            'Family profiles',
            'Priority recommendations',
            'Early access features',
        ],
        cta: 'Choose Premium',
        stripePriceIds: {
            monthly: null,
            yearly: null,
        },
        limits: {
            vaultSize: null,
            smartRecommendations: true,
            advancedInsights: true,
            userRating: true,
            continueWatching: true,
            familyProfiles: true,
            priorityRecommendations: true,
            earlyAccess: true,
        },
    },
];


export const formatPrice=(
    price:number,
    interval:BillingInterval,
):string=>{
    if(price===0) return '$0';
    const formatted=price.toFixed(2);
    return interval==='monthly' ? `$${formatted}`:`$${formatted}`;
};


export const getEffectivePrice=(plan:Plan):string=>{
    if (plan.yearlyPrice===0) return '$0';
    return `$${(plan.yearlyPrice/12).toFixed(2)}`;
};



export const getYearlySavingsPercent=(plan:Plan):number=>{
    if(plan.yearlyPrice===0) return 0;
    const yearlyAtMonthlyRate = plan.monthlyPrice * 12;
	const savings = yearlyAtMonthlyRate - plan.yearlyPrice;
    return Math.round((savings/yearlyAtMonthlyRate)*100);
};


export const getPlan=(id:PlanId):Plan|undefined=>{
    return PLANS.find(plan=>plan.id===id);
}